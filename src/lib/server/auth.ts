import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { authEnv } from "./auth-env";

export const auth = betterAuth({
  baseURL: authEnv.appBaseUrl,
  secret: authEnv.betterAuthSecret,
  basePath: "/api/auth",
  socialProviders: {
    github: {
      clientId: authEnv.githubClientId,
      clientSecret: authEnv.githubClientSecret,
      // Keep OAuth flow but request only the exact scopes we need.
      disableDefaultScope: true,
      scope: ["user:email", "read:org", "repo"],
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwe",
      refreshCache: true,
    },
  },
  plugins: [tanstackStartCookies()],
});
