import got from "got"

import { logger } from "../../logger"
import { GoogleOAuth } from "./OAuth"
import { GoogleUser } from "./User"

export class GoogleClient {

  constructor(
    private readonly webBaseUrl: string,
    private readonly tokenBaseUrl: string,
    private readonly userInfoBaseUrl: string,
  ) { }

  /**a
   * `POST /login/oauth/access_token`
   *
   * [Web application flow](bit.ly/2mNSppX).
   */
  requestAccessToken = async (code: string, clientId: string, clientSecret: string, redirectUrl: string): Promise<GoogleOAuth> => {
    const url = this.tokenBaseUrl + "/token"
    const options = {
      method: "POST",
      json: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUrl,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUrl,
      },
    } as const
    return got(url, options).json().catch(e => {
      logger.error(e)
      throw e
    })
  }

  /**
   * `GET /user`
   *
   * [Get the authenticated user](https://developer.github.com/v3/users/#get-the-authenticated-user)
   */
  requestUser = async (accessToken: string): Promise<GoogleUser> => {
    const url = this.userInfoBaseUrl + "/v1/userinfo"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    } as const
    return got(url, options).json()
  }

}
