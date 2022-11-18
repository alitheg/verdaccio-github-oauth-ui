import { GoogleAuthProvider } from "src/server/google"
import { ParsedPluginConfig } from "src/server/plugin/Config"
import { createTestParsedPluginConfig } from "test/utils"
import { describe, expect, it } from "vitest"

describe("GoogleAuthProvider", () => {
  describe("getLoginUrl", () => {
    it("Google", () => {
      const config = createTestParsedPluginConfig()
      const provider = new GoogleAuthProvider(config as ParsedPluginConfig)
      const loginUrl = provider.getLoginUrl("callbackUrl")

      expect(loginUrl).toMatchInlineSnapshot(
        '"https://github.com/login/oauth/authorize?client_id=CLIENT_ID&redirect_uri=callbackUrl"',
      )
    })
  })
})
