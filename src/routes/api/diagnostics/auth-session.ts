import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

import { auth } from "@/lib/server/auth";
import { authEnv } from "@/lib/server/auth-env";

const FORWARDED_HEADER_NAMES = [
  "host",
  "origin",
  "referer",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
  "x-forwarded-for",
  "x-forwarded-uri",
  "x-forwarded-prefix",
  "x-forwarded-scheme",
] as const;

function parseCookieNames(cookieHeader: string | null): string[] {
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const equalsIndex = part.indexOf("=");
      return equalsIndex === -1 ? part : part.slice(0, equalsIndex);
    });
}

function pickHeaders(headers: Headers): Record<string, string | null> {
  return FORWARDED_HEADER_NAMES.reduce<Record<string, string | null>>((acc, headerName) => {
    acc[headerName] = headers.get(headerName);
    return acc;
  }, {});
}

function normalizeOrigin(input: string): string | null {
  try {
    return new URL(input).origin;
  } catch {
    return null;
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export const Route = createFileRoute("/api/diagnostics/auth-session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const cookieHeader = request.headers.get("cookie");
        const cookieNames = parseCookieNames(cookieHeader);
        const hasPotentialAuthCookie = cookieNames.some((name) =>
          /better-auth|session|auth/i.test(name),
        );

        const expectedOrigin = normalizeOrigin(authEnv.appBaseUrl);
        const forwardedHost = request.headers.get("x-forwarded-host");
        const forwardedProto = request.headers.get("x-forwarded-proto");
        const fallbackHost = request.headers.get("host");
        const effectiveHost = forwardedHost || fallbackHost;
        const effectiveProto = forwardedProto || requestUrl.protocol.replace(":", "");
        const effectiveOrigin =
          effectiveHost && effectiveProto ? `${effectiveProto}://${effectiveHost}` : requestUrl.origin;

        let sessionPresent = false;
        let sessionError: string | null = null;
        let sessionExpiresAt: string | null = null;

        try {
          const sessionResult = (await auth.api.getSession({
            headers: request.headers,
          })) as {
            session?: { expiresAt?: string };
          } | null;

          sessionPresent = Boolean(sessionResult);
          sessionExpiresAt = sessionResult?.session?.expiresAt ?? null;
        } catch (error) {
          sessionError = toErrorMessage(error);
        }

        let githubAccessTokenPresent = false;
        let githubAccessTokenError: string | null = null;

        try {
          const tokenResult = await auth.api.getAccessToken({
            headers: request.headers,
            body: { providerId: "github" },
          });

          githubAccessTokenPresent =
            typeof tokenResult === "string"
              ? tokenResult.length > 0
              : Boolean(tokenResult?.accessToken);
        } catch (error) {
          githubAccessTokenError = toErrorMessage(error);
        }

        const hints: string[] = [];

        if (!cookieHeader) {
          hints.push("No cookie header was sent with this request.");
        }

        if (cookieNames.length > 0 && !hasPotentialAuthCookie) {
          hints.push(
            "Cookies are present, but none look like auth/session cookies. Check cookie domain/path/samesite settings.",
          );
        }

        if (expectedOrigin && expectedOrigin !== effectiveOrigin) {
          hints.push(
            `APP_BASE_URL origin (${expectedOrigin}) does not match effective request origin (${effectiveOrigin}).`,
          );
        }

        if (!sessionPresent && hasPotentialAuthCookie) {
          hints.push(
            "Auth-like cookies are present but getSession returned no session. Cookie may be expired, signed with a different secret, or scoped to a different host.",
          );
        }

        if (sessionPresent && !githubAccessTokenPresent) {
          hints.push(
            "Session exists but no GitHub access token could be resolved. Re-authentication may be needed.",
          );
        }

        return json(
          {
            now: new Date().toISOString(),
            request: {
              url: request.url,
              method: request.method,
              origin: requestUrl.origin,
              effectiveOrigin,
              headers: pickHeaders(request.headers),
              cookieHeaderPresent: Boolean(cookieHeader),
              cookieCount: cookieNames.length,
              cookieNames,
              hasPotentialAuthCookie,
            },
            config: {
              appBaseUrl: authEnv.appBaseUrl,
              appBaseOrigin: expectedOrigin,
            },
            auth: {
              sessionPresent,
              sessionExpiresAt,
              sessionError,
              githubAccessTokenPresent,
              githubAccessTokenError,
            },
            hints,
          },
          {
            headers: {
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});
