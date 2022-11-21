import {
  Config as IncorrectVerdaccioConfig,
  PackageAccess as IncorrectVerdaccioPackageAccess,
  Security,
} from "@verdaccio/types"
import get from "lodash/get"
import assert from "ow"
import process from "process"
import { PartialDeep, RemoveIndexSignature } from "type-fest"
import { pluginKey } from "../../constants"
import { logger } from "../../logger"

//
// Types
//

// Verdaccio incorrectly types some of these as string arrays
// although they are all strings.
export interface PackageAccess extends IncorrectVerdaccioPackageAccess {
  unpublish?: string[]
}

export type VerdaccioConfig = Omit<
  RemoveIndexSignature<IncorrectVerdaccioConfig>,
  "packages" | "security"
> & {
  packages?: Record<string, PackageAccess>
  security?: PartialDeep<Security>
}

export interface PluginConfig {
  "client-id": string,
  "client-secret": string,
  "domain"?: string,
}

export interface Config extends VerdaccioConfig {
  middlewares: { [key: string]: PluginConfig }
  auth: { [key: string]: PluginConfig }
}

export interface GroupParts {
  providerId?: string
  key1?: string
  value1?: string
}

export type ParsedUser = {
  group: string
  user: string
}

export type ParsedGroup = {
  group: string,
  email: string
}

/**
 * e.g. "5.0.4"
 */
export function getVersion(): string {
  return require("verdaccio/package.json").version
}

//
// Validation
//

function validateVersion() {
  const version = getVersion()

  if (version < "5") {
    throw new Error("This plugin requires verdaccio 5 or above")
  }
}

function validateNodeExists(config: Config, node: keyof Config) {
  const path = `[${node}][${pluginKey}]`
  const obj = get(config, path, {})

  if (!Object.keys(obj).length) {
    throw new Error(`"${node}.${pluginKey}" must be enabled`)
  }
}

function getConfigValue<T>(config: Config, key: string, predicate: any, mandatory: Boolean = false): T {
  let valueOrEnvName = get(config, ["auth", pluginKey, key])

  const value = process.env[String(valueOrEnvName)] ?? valueOrEnvName
  if(value || !value && mandatory) {
    try {
      assert(value, predicate)
    } catch (error) {
      logger.error(
        `Invalid configuration at "auth.${pluginKey}.${key}": ${error.message} — Please check your verdaccio config.`,
      )
      process.exit(1)
    }
  }

  return value as T
}

//
// Implementation
//

export class ParsedPluginConfig {
  readonly url_prefix = this.config.url_prefix ?? ""

  readonly clientId = getConfigValue<string>(
    this.config,
    "client-id",
    assert.string.nonEmpty,
  )

  readonly clientSecret = getConfigValue<string>(
    this.config,
    "client-secret",
    assert.string.nonEmpty,
  )

  readonly domain = getConfigValue<string>(
    this.config,
    "domain",
    assert.string.nonEmpty,
    false
  )

  constructor(readonly config: Config) {
    validateVersion()

    validateNodeExists(config, "middlewares")
    validateNodeExists(config, "auth")

    this.parseConfiguredPackageGroups()
  }

  readonly configuredGroupsMap: Record<string, boolean> = {}
  readonly parsedUsers: ParsedUser[] = []
  readonly parsedGroups: ParsedGroup[] = []

  isGroupConfigured(group: string) {
    logger.log('isConfigured', group, this.configuredGroupsMap[group])
    return !!this.configuredGroupsMap[group]
  }

  /**
   * Returns all permission groups used in the Verdacio config.
   */
  private parseConfiguredPackageGroups() {
    Object.values(this.config.packages || {}).forEach((packageConfig) => {
      ;["access", "publish", "unpublish"]
        .flatMap((key) => packageConfig[key])
        .forEach((group) => {
          if (typeof group !== "string") {
            return
          }

          logger.log('parsing', group);
          const [providerId, key1, value1] =
            group.split("/")

          if (providerId !== "google") {
            return null
          }

          if (key1 === "user") {
            const parsedUser: ParsedUser = {
              group,
              user: value1,
            }
            this.parsedUsers.push(parsedUser)
            this.configuredGroupsMap[value1] = true
          }

          if (key1 === "group") {
            const parsedGroup: ParsedGroup = {
              group,
              email: value1,
            }
            this.parsedGroups.push(parsedGroup)
            this.configuredGroupsMap[value1] = true
          }
        })
      })
    }
}
