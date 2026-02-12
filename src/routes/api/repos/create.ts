import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

import { createRepositoryPayloadSchema, normalizeRepoName } from "@/lib/new-repo-wizard";
import { auth } from "@/lib/server/auth";

const GITHUB_API_BASE = "https://api.github.com";
const DEV_GITHUB_TOKEN = import.meta.env.DEV ? process.env.GITHUB_DEV_TOKEN?.trim() : undefined;

type GitHubUser = {
  login: string;
};

type GitHubErrorPayload = {
  message?: string;
};

type CreateRepoResponse = {
  full_name: string;
  html_url: string;
  name: string;
};

async function getAccessToken(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (session) {
    const tokenResult = await auth.api.getAccessToken({
      headers: requestHeaders,
      body: { providerId: "github" },
    });

    const sessionToken = typeof tokenResult === "string" ? tokenResult : tokenResult?.accessToken;

    if (sessionToken) {
      return sessionToken;
    }
  }

  return DEV_GITHUB_TOKEN;
}

function githubHeaders(accessToken: string, hasJsonBody = false): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": "github-light",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
  };
}

async function readGitHubErrorMessage(response: Response) {
  const payload = (await response
    .json()
    .catch(() => null)) as GitHubErrorPayload | null;

  return payload?.message ?? "GitHub request failed";
}

export const Route = createFileRoute("/api/repos/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accessToken = await getAccessToken(request.headers);

        if (!accessToken) {
          return json({ error: "Missing GitHub access token" }, { status: 401 });
        }

        const input = await request.json().catch(() => null);
        const parsed = createRepositoryPayloadSchema.safeParse(input);

        if (!parsed.success) {
          return json({ error: "Invalid repository payload" }, { status: 400 });
        }

        const payload = parsed.data;

        const userResponse = await fetch(`${GITHUB_API_BASE}/user`, {
          headers: githubHeaders(accessToken),
        });

        if (!userResponse.ok) {
          const message = await readGitHubErrorMessage(userResponse);
          return json({ error: `Unable to resolve GitHub user: ${message}` }, { status: 401 });
        }

        const user = (await userResponse.json()) as GitHubUser;
        const isUserOwnedRepo = user.login.toLowerCase() === payload.ownerLogin.toLowerCase();

        const githubPath = isUserOwnedRepo
          ? `${GITHUB_API_BASE}/user/repos`
          : `${GITHUB_API_BASE}/orgs/${encodeURIComponent(payload.ownerLogin)}/repos`;

        const createResponse = await fetch(githubPath, {
          method: "POST",
          headers: githubHeaders(accessToken, true),
          body: JSON.stringify({
            name: normalizeRepoName(payload.name),
            description: payload.description || undefined,
            private: payload.visibility === "private",
            auto_init: payload.autoInit,
            gitignore_template: payload.autoInit ? payload.gitignoreTemplate || undefined : undefined,
            license_template: payload.autoInit ? payload.licenseTemplate || undefined : undefined,
          }),
        });

        if (!createResponse.ok) {
          const message = await readGitHubErrorMessage(createResponse);
          return json(
            {
              error: message,
              hint:
                createResponse.status === 403
                  ? "Your token may be missing repository creation permissions for the selected owner."
                  : undefined,
            },
            { status: createResponse.status },
          );
        }

        const createdRepo = (await createResponse.json()) as CreateRepoResponse;

        return json({
          repo: {
            fullName: createdRepo.full_name,
            htmlUrl: createdRepo.html_url,
            name: createdRepo.name,
          },
        });
      },
    },
  },
});
