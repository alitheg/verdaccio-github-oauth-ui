import got from "got"

import { logger } from "../../logger"
import { GoogleOAuth } from "./OAuth"
import { GoogleUser } from "./User"
import { GoogleGroupResponse } from "./Group"

export class GoogleClient {

  constructor(
    private readonly webBaseUrl: string,
    private readonly tokenBaseUrl: string,
    private readonly userInfoBaseUrl: string,
    private readonly groupUrl: string,
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
      },
    } as const
    logger.log("calling", url, JSON.stringify(options))
    return got(url, options).json().catch(e => {
      logger.error(e)
      if(e.response) {
        logger.error(e.response.body)
      }
      throw e
    }) as Promise<GoogleOAuth>
  }

  /**
   * `GET /user`
   *
   * [Obtaining user profile information](https://developers.google.com/identity/openid-connect/openid-connect#obtaininguserprofileinformation)
   */
  requestUser = async (accessToken: string): Promise<GoogleUser> => {
    const url = this.userInfoBaseUrl + "/v1/userinfo"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    } as const
    return got(url, options).json().catch(e => {
      logger.error(e)
      throw e
    }) as Promise<GoogleUser>
  }

  requestGroups = async (accessToken: string, userName: string): Promise<GoogleGroupResponse> => {
    const url = this.groupUrl + `?userKey=${userName}`
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    } as const
    return got(url, options).json().catch(e => {
      logger.error(e)
      throw e
    }) as Promise<GoogleGroupResponse>
  }

}
