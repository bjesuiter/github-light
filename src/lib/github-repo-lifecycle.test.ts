import { afterEach, beforeAll, describe, expect, it } from "vitest";

const GITHUB_API_BASE = "https://api.github.com";
const token = process.env.GITHUB_DEV_TOKEN?.trim();
const runLifecycleTests = process.env.RUN_GITHUB_LIFECYCLE_TESTS === "true";
const allowDestructiveTests = process.env.ALLOW_GITHUB_DESTRUCTIVE_TESTS === "true";
const repoPrefix = process.env.GITHUB_TEST_REPO_PREFIX?.trim() || "github-light-e2e";

if (!runLifecycleTests || !allowDestructiveTests || !token) {
  console.warn(
    "[github-repo-lifecycle.test] Skipping destructive repo lifecycle test. " +
      "Set RUN_GITHUB_LIFECYCLE_TESTS=true, ALLOW_GITHUB_DESTRUCTIVE_TESTS=true, and GITHUB_DEV_TOKEN.",
  );
}

const lifecycleDescribe = runLifecycleTests && allowDestructiveTests && token ? describe : describe.skip;

type GitHubUser = {
  login: string;
};

type GitHubRepo = {
  name: string;
  full_name: string;
};

async function requestGitHub(path: string, init?: RequestInit) {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "github-light-tests",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });

  return response;
}

async function waitFor(
  predicate: () => Promise<boolean>,
  { timeoutMs = 15_000, intervalMs = 1_000 }: { timeoutMs?: number; intervalMs?: number } = {},
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await predicate()) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

lifecycleDescribe("GitHub repo lifecycle", () => {
  let ownerLogin: string;
  let createdRepoFullName: string | null = null;

  beforeAll(async () => {
    const userResponse = await requestGitHub("/user");
    expect(userResponse.ok).toBe(true);

    const user = (await userResponse.json()) as GitHubUser;
    expect(user.login).toBeTruthy();

    ownerLogin = user.login;
  });

  afterEach(async () => {
    if (!createdRepoFullName) {
      return;
    }

    const deleteResponse = await requestGitHub(`/repos/${createdRepoFullName}`, {
      method: "DELETE",
    });

    if (![204, 404].includes(deleteResponse.status)) {
      const body = await deleteResponse.text();
      throw new Error(`Failed to cleanup test repo ${createdRepoFullName}: ${deleteResponse.status} ${body}`);
    }

    createdRepoFullName = null;
  });

  it("creates a repository, verifies it exists, and deletes it", async () => {
    const repoName = `${repoPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const createResponse = await requestGitHub("/user/repos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: repoName,
        private: true,
        auto_init: false,
        description: "Temporary integration test repo for github-light",
      }),
    });

    const createBody = (await createResponse.json()) as GitHubRepo & { message?: string };

    if (!createResponse.ok) {
      throw new Error(`Create repo failed with ${createResponse.status}: ${createBody.message ?? "Unknown error"}`);
    }

    expect(createResponse.status).toBe(201);
    expect(createBody.name).toBe(repoName);

    createdRepoFullName = createBody.full_name;
    expect(createdRepoFullName).toBe(`${ownerLogin}/${repoName}`);

    const repoFetchResponse = await requestGitHub(`/repos/${createdRepoFullName}`);
    expect(repoFetchResponse.status).toBe(200);

    const foundInRepoList = await waitFor(async () => {
      const listResponse = await requestGitHub("/user/repos?type=owner&sort=updated&per_page=100");

      if (!listResponse.ok) {
        return false;
      }

      const repos = (await listResponse.json()) as Array<GitHubRepo>;
      return repos.some((repo) => repo.name === repoName);
    });

    expect(foundInRepoList).toBe(true);

    const deleteResponse = await requestGitHub(`/repos/${createdRepoFullName}`, {
      method: "DELETE",
    });
    expect(deleteResponse.status).toBe(204);

    const confirmedDeleted = await waitFor(async () => {
      const getResponse = await requestGitHub(`/repos/${createdRepoFullName}`);
      return getResponse.status === 404;
    });

    expect(confirmedDeleted).toBe(true);
    createdRepoFullName = null;
  });
});
