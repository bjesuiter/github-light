import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

import { auth } from "@/lib/server/auth";

type GitHubUser = {
  id: number;
  login: string;
  avatar_url: string;
};

type GitHubOrgMembership = {
  role: "admin" | "member";
  organization: {
    login: string;
  };
};

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: "User" | "Organization";
    avatar_url: string;
  };
  private: boolean;
  archived: boolean;
  fork: boolean;
  html_url: string;
  updated_at: string;
  stargazers_count: number;
  description: string | null;
};

type RepoGroup = {
  owner: {
    login: string;
    type: "User" | "Organization";
    avatarUrl: string;
    isViewer: boolean;
    isOwnOrg: boolean;
  };
  repos: Array<GitHubRepo>;
};

const GITHUB_API_BASE = "https://api.github.com";
const DEV_GITHUB_TOKEN = import.meta.env.DEV ? process.env.GITHUB_DEV_TOKEN?.trim() : undefined;

class GitHubApiError extends Error {
  status: number;

  constructor(status: number, url: string) {
    super(`GitHub API request failed (${status}) for ${url}`);
    this.status = status;
  }
}

async function fetchGitHubPage<T>(url: string, accessToken: string): Promise<Array<T>> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "github-light",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new GitHubApiError(response.status, url);
  }

  return (await response.json()) as Array<T>;
}

async function fetchAllPages<T>(path: string, accessToken: string): Promise<Array<T>> {
  const items: Array<T> = [];
  let page = 1;

  while (true) {
    const pageItems = await fetchGitHubPage<T>(
      `${GITHUB_API_BASE}${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`,
      accessToken,
    );
    items.push(...pageItems);
    if (pageItems.length < 100) {
      break;
    }
    page += 1;
  }

  return items;
}

function getOwnerRank(owner: RepoGroup["owner"]): number {
  if (owner.isViewer) {
    return 0;
  }
  if (owner.isOwnOrg) {
    return 1;
  }
  return 2;
}

export const Route = createFileRoute("/api/projects")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });

        let accessToken: string | undefined;

        if (session) {
          const tokenResult = await auth.api.getAccessToken({
            headers: request.headers,
            body: { providerId: "github" },
          });

          accessToken =
            typeof tokenResult === "string"
              ? tokenResult
              : tokenResult?.accessToken;
        }

        if (!accessToken && DEV_GITHUB_TOKEN) {
          accessToken = DEV_GITHUB_TOKEN;
        }

        if (!accessToken) {
          return json(
            {
              error: "Missing GitHub access token",
              hint:
                import.meta.env.DEV
                  ? "Set GITHUB_DEV_TOKEN in your local .env to bypass OAuth during development."
                  : undefined,
            },
            { status: 401 },
          );
        }

        const userResponse = await fetch(`${GITHUB_API_BASE}/user`, {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "github-light",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        if (!userResponse.ok) {
          return json({ error: "GitHub user profile access denied" }, { status: 401 });
        }

        const user = (await userResponse.json()) as GitHubUser;

        const memberships = await fetchAllPages<GitHubOrgMembership>(
          "/user/memberships/orgs",
          accessToken,
        ).catch((error) => {
          if (error instanceof GitHubApiError && (error.status === 403 || error.status === 404)) {
            return [];
          }
          throw error;
        });

        const repos = await fetchAllPages<GitHubRepo>(
          "/user/repos?affiliation=owner,organization_member&sort=updated",
          accessToken,
        ).catch((error) => {
          if (error instanceof GitHubApiError && (error.status === 403 || error.status === 404)) {
            return [];
          }
          throw error;
        });

        const ownOrgLogins = new Set(
          memberships
            .filter((membership) => membership.role === "admin")
            .map((membership) => membership.organization.login.toLowerCase()),
        );

        const groupsByOwner = new Map<string, RepoGroup>();

        for (const repo of repos) {
          const ownerLogin = repo.owner.login;
          const key = ownerLogin.toLowerCase();

          if (!groupsByOwner.has(key)) {
            groupsByOwner.set(key, {
              owner: {
                login: ownerLogin,
                type: repo.owner.type,
                avatarUrl: repo.owner.avatar_url,
                isViewer: ownerLogin.toLowerCase() === user.login.toLowerCase(),
                isOwnOrg: ownOrgLogins.has(key),
              },
              repos: [],
            });
          }

          groupsByOwner.get(key)?.repos.push(repo);
        }

        const groups = Array.from(groupsByOwner.values())
          .map((group) => ({
            ...group,
            repos: group.repos.sort((a, b) => a.name.localeCompare(b.name)),
          }))
          .sort((a, b) => {
            const rankDiff = getOwnerRank(a.owner) - getOwnerRank(b.owner);
            if (rankDiff !== 0) {
              return rankDiff;
            }
            return a.owner.login.localeCompare(b.owner.login);
          });

        return json({
          viewer: user,
          groups,
        });
      },
    },
  },
});
