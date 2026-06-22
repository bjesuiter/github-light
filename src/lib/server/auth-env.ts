function requiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const authEnv = {
  appBaseUrl: requiredEnv("APP_BASE_URL", process.env.APP_BASE_URL),
  betterAuthSecret: requiredEnv("BETTER_AUTH_SECRET", process.env.BETTER_AUTH_SECRET),
  githubClientId: requiredEnv("GITHUB_CLIENT_ID", process.env.GITHUB_CLIENT_ID),
  githubClientSecret: requiredEnv("GITHUB_CLIENT_SECRET", process.env.GITHUB_CLIENT_SECRET),
};
