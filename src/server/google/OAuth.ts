/**
 * https://developers.google.com/identity/openid-connect/openid-connect#server-flow
 */
export interface GoogleOAuth {
  token_type: string
  scope: string
  access_token: string
}
