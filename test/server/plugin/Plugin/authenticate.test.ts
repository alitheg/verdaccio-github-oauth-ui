import { GoogleAuthProvider } from "src/server/google/AuthProvider"
import { Plugin } from "src/server/plugin/Plugin"
import {
  createTestPlugin,
  testOAuthToken,
  testUserName,
  testProviderGroups
} from "test/utils"
import { beforeEach, describe, expect, it } from "vitest"

// jest.mock("src/server/google/AuthProvider")

// tslint:disable-next-line: variable-name
const AuthProvider: GoogleAuthProvider = GoogleAuthProvider as any// & jest.MockInstance<any, any> = GoogleAuthProvider as any

describe("Plugin", () => {
  describe("authenticate", () => {
    let plugin: Plugin

    beforeEach(() => {
      // AuthProvider.mockImplementation(() => {
      //   return {
      //     async getId() {
      //       return "test"
      //     },
      //     async getUsername(token: string) {
      //       return token === testOAuthToken ? testUsername : ""
      //     },
      //     async getGroups(token: string) {
      //       return token === testOAuthToken ? ['google'] : []
      //     },
      //   }
      // })
      plugin = createTestPlugin()
    })

    it("empty user name cannot authenticate", async () => {
      await plugin.authenticate("", testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("empty token cannot authenticate", async () => {
      await plugin.authenticate(testUserName, "", (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("invalid token cannot authenticate", async () => {
      await plugin.authenticate(testUserName, "invalidToken", (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("valid user name and token can authenticate", async () => {
      await plugin.authenticate(testUserName, testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toEqual(expect.arrayContaining(testProviderGroups))
      })
    })
  })
})
