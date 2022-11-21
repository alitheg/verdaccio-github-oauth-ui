import { group } from "console"
import { Request } from "express"
import uniq from "lodash/uniq"
import { stringify } from "querystring"
import { logger } from "../../logger"
import { AuthProvider } from "../plugin/AuthProvider"
import { ParsedPluginConfig } from "../plugin/Config"
import { GoogleClient } from "./Client"

export class GoogleAuthProvider implements AuthProvider {
  private readonly id = "google"

  private readonly clientId = this.config.clientId
  private readonly clientSecret = this.config.clientSecret
  private readonly requiredDomain = this.config.domain
  private readonly client = new GoogleClient(this.authBaseUrl, this.tokenBaseUrl, this.userInfoBaseUrl, this.groupUrl)

  get authBaseUrl(): string {
    return "https://accounts.google.com"
  }

  get tokenBaseUrl(): string {
    return "https://oauth2.googleapis.com"
  }

  get userInfoBaseUrl(): string {
    return "https://openidconnect.googleapis.com"
  }

  get groupUrl(): string {
    return "https://admin.googleapis.com/admin/directory/v1/groups"
  }

  constructor(
    private readonly config: ParsedPluginConfig,
  ) { }

  getId() {
    return this.id
  }

  getLoginUrl(callbackUrl: string) {
    const params = {
      client_id: this.clientId,
      redirect_uri: callbackUrl,
      scope: "openid email profile https://www.googleapis.com/auth/admin.directory.group.readonly",
      response_type: "code"
    }
    if(this.requiredDomain) params["hd"] = this.requiredDomain
    const queryParams = stringify(params)
    return this.authBaseUrl + `/o/oauth2/v2/auth?` + queryParams
  }

  getCode(req: Request) {
    return req.query.code as string
  }

  async getToken(code: string, redirectUrl: string) {
    const auth = await this.client.requestAccessToken(code, this.clientId, this.clientSecret, redirectUrl)
    // logger.log('accesstoken', auth.access_token);
    return auth.access_token
  }

  async getUserName(token: string) {
    const user = await this.client.requestUser(token)
    return user.email
  }

  async getGroups(token: string, userName: string) {
    const response = await this.client.requestGroups(token, userName)
    let serverGroups: string[] = [];
    const groups: string[] = []
    if(response.groups  && response.groups.length > 0) {
      serverGroups = response.groups.map(g => g.email)
    }
    const configuredUser = this.config.parsedUsers.find(
      (config) => config.user === userName,
    )
    if (configuredUser) {
      groups.push(configuredUser.group)
    }
    this.config.parsedGroups.forEach((c) => {
      if(serverGroups.indexOf(c.email) > -1) {
        groups.push(c.email);
      }
    })
    return uniq(groups).filter(Boolean).sort();
  }

}
