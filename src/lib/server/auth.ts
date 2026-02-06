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
      // GitHub Apps use app permissions instead of OAuth scopes.
      disableDefaultScope: true,
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
