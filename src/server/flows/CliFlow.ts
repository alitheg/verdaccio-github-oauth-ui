import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler } from "express"
import qs from "query-string"
import { getPublicUrl } from "verdaccio/build/lib/utils"
import { cliPort, cliProviderId } from "../../constants"
import { logger } from "../../logger"
import { getCallbackPath } from "../../redirect"
import { AuthCore } from "../plugin/AuthCore"
import { AuthProvider } from "../plugin/AuthProvider"
import { Verdaccio } from "../plugin/Verdaccio"

const pluginCallbackUrl = getCallbackPath(cliProviderId)

export class CliFlow implements IPluginMiddleware<any> {
  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly core: AuthCore,
    private readonly provider: AuthProvider,
  ) {}

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.get(pluginCallbackUrl, this.callback)
  }

  callback: Handler = async (req, res) => {
    const params: Record<string, string> = {}
    const baseUrl = getPublicUrl(this.verdaccio.getUrlPrefix(), req).replace(/\/$/, "")

    try {
      const code = this.provider.getCode(req)
      const userToken = await this.provider.getToken(code, `${baseUrl}${pluginCallbackUrl}`)
      const userName = await this.provider.getUserName(userToken)
      const userGroups = await this.provider.getGroups(userToken, userName)
      const user = await this.core.createAuthenticatedUser(userName, userGroups)
      const npmToken = await this.verdaccio.issueNpmToken(user, userToken)

      params.status = "success"
      params.token = encodeURIComponent(npmToken)
    } catch (error) {
      logger.log(error)

      params.status = "error"
      params.message = error.message || error
    }

    const redirectUrl =
      `http://localhost:${cliPort}` + "?" + qs.stringify(params)

    res.redirect(redirectUrl)
  }
}
