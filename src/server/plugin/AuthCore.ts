import { stringify } from "querystring"
import { authenticatedUserGroups } from "../../constants"
import { logger } from "../../logger"
import { ParsedPluginConfig } from "./Config"
import { User, Verdaccio } from "./Verdaccio"

export class AuthCore {
  private readonly requiredGroup = 'google'
  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly config: ParsedPluginConfig,
  ) {}

  async createAuthenticatedUser(
    userName: string,
    userGroups: string[],
  ): Promise<User> {
    const relevantGroups = userGroups
      .filter((group) => this.config.isGroupConfigured(group))
      .filter(Boolean)
      .sort()

    const user: User = {
      name: userName,
      groups: [...authenticatedUserGroups],
      real_groups: relevantGroups,
    }

    logger.log("User successfuly authenticated:", user)
    return user
  }

  async createUiCallbackUrl(
    userName: string,
    userGroups: string[],
    userToken: string,
  ): Promise<string> {
    const user = await this.createAuthenticatedUser(userName, userGroups)

    const uiToken = await this.verdaccio.issueUiToken(user)
    const npmToken = await this.verdaccio.issueNpmToken(user, userToken)

    const query = { username: userName, uiToken, npmToken }
    const url = "/?" + stringify(query)

    return url
  }

  canAuthenticate(username: string) {
    return true;
    if (!allow) {
      logger.error(this.getDeniedMessage(username))
    }
    return allow
  }

  canAccess(username: string, groups: string[], requiredGroups: string[]) {
    if (requiredGroups.includes("$authenticated")) {
      requiredGroups.push(this.requiredGroup)
    }
    const grantedAccess = [];//intersection(groups, requiredGroups)

    const allow = grantedAccess.length === requiredGroups.length
    if (!allow) {
      logger.error(this.getDeniedMessage(username))
    }
    return allow
  }

  getDeniedMessage(username: string) {
    return `Access denied: User "${username}" is not a member of "${this.requiredGroup}"`
  }

}
