import { config as loadDotEnv } from "dotenv";

loadDotEnv();

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const authEnv = {
  appBaseUrl: requiredEnv("APP_BASE_URL"),
  betterAuthSecret: requiredEnv("BETTER_AUTH_SECRET"),
  githubClientId: requiredEnv("GITHUB_CLIENT_ID"),
  githubClientSecret: requiredEnv("GITHUB_CLIENT_SECRET"),
};
