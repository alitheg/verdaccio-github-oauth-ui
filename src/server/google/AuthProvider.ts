import { Request } from "express"
import uniq from "lodash/uniq"
import { stringify } from "querystring"
import { AuthProvider } from "../plugin/AuthProvider"
import { ParsedPluginConfig } from "../plugin/Config"
import { GoogleClient } from "./Client"

export class GoogleAuthProvider implements AuthProvider {
  private readonly id = "google"

  private readonly clientId = this.config.clientId
  private readonly clientSecret = this.config.clientSecret
  private readonly requiredDomain = this.config.domain
  private readonly client = new GoogleClient(this.authBaseUrl, this.tokenBaseUrl, this.userInfoBaseUrl)

  get authBaseUrl(): string {
    return "https://accounts.google.com"
  }

  get tokenBaseUrl(): string {
    return "https://oauth2.googleapis.com"
  }

  get userInfoBaseUrl(): string {
    return "https://openidconnect.googleapis.com"
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
      scope: "openid email profile",
      response_type: "code"
    }
    if(this.requiredDomain) params.hd = this.requiredDomain
    const queryParams = stringify(params)
    return this.authBaseUrl + `/o/oauth2/v2/auth?` + queryParams
  }

  getCode(req: Request) {
    return req.query.code as string
  }

  async getToken(code: string, redirectUrl: string) {
    const auth = await this.client.requestAccessToken(code, this.clientId, this.clientSecret, redirectUrl)
    return auth.access_token
  }

  async getUserName(token: string) {
    const user = await this.client.requestUser(token)
    return user.email
  }

  async getGroups(token: string) {
    return ['google']
  }

}
