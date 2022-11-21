/**
 * https://developers.google.com/admin-sdk/directory/v1/guides/manage-groups#json-response_4
 */
export interface GoogleGroup {
    email: string
    name: string
}
export interface GoogleGroupResponse {
  groups: GoogleGroup[]
}
