/**
 * https://developers.google.com/identity/openid-connect/openid-connect#obtaininguserprofileinformation
 */
export interface GoogleUser {
  email: string
  given_name: string
  family_name: string
  name: string
}
