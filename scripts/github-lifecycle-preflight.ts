const GITHUB_API_BASE = "https://api.github.com";
const token = process.env.GITHUB_DEV_TOKEN?.trim();

function formatStatus(status: number) {
  return status >= 200 && status < 300 ? "✅" : "❌";
}

async function requestGitHub(path: string, init?: RequestInit) {
  return fetch(`${GITHUB_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "github-light-preflight",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
}

async function readBodyMessage(response: Response) {
  const payload = (await response
    .clone()
    .json()
    .catch(() => null)) as { message?: string; documentation_url?: string } | null;
  return payload?.message ?? "Unknown error";
}

async function main() {
  if (!token) {
    console.error("❌ Missing GITHUB_DEV_TOKEN. Set it in your environment before running preflight.");
    process.exit(1);
  }

  console.log("🔍 GitHub lifecycle preflight");

  const userResponse = await requestGitHub("/user");
  const userMessage = await readBodyMessage(userResponse);
  const oauthScopes = userResponse.headers.get("x-oauth-scopes") || "(not reported)";

  if (!userResponse.ok) {
    console.error(`${formatStatus(userResponse.status)} /user -> ${userResponse.status} (${userMessage})`);
    console.error(`Token scopes: ${oauthScopes}`);
    process.exit(1);
  }

  const user = (await userResponse.json()) as { login: string };
  console.log(`✅ /user -> ${userResponse.status} (authenticated as ${user.login})`);
  console.log(`ℹ️  Token scopes: ${oauthScopes}`);

  const listResponse = await requestGitHub("/user/repos?type=owner&per_page=1");
  const listMessage = await readBodyMessage(listResponse);

  if (!listResponse.ok) {
    console.error(`${formatStatus(listResponse.status)} /user/repos -> ${listResponse.status} (${listMessage})`);
    console.error("❌ Token cannot read owned repositories; lifecycle test cannot run.");
    process.exit(1);
  }

  console.log(`✅ /user/repos -> ${listResponse.status} (can read owned repos)`);

  const createProbeResponse = await requestGitHub("/user/repos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Intentionally invalid payload to probe permission without creating a repository.
    body: JSON.stringify({}),
  });
  const createProbeMessage = await readBodyMessage(createProbeResponse);

  if (createProbeResponse.status === 422) {
    console.log("✅ /user/repos (POST probe) -> 422 validation error as expected (create permission appears available)");
    console.log("✅ Preflight passed. You can run the destructive lifecycle test.");
    return;
  }

  if (createProbeResponse.status === 403 || createProbeResponse.status === 401) {
    console.error(
      `❌ /user/repos (POST probe) -> ${createProbeResponse.status} (${createProbeMessage})\n` +
        "❌ Token appears unable to create repositories.\n" +
        "   For classic PATs: include `repo` scope.\n" +
        "   For fine-grained PATs: grant repository Administration (write) on target repos/account.",
    );
    process.exit(2);
  }

  if (!createProbeResponse.ok) {
    console.error(`❌ /user/repos (POST probe) -> ${createProbeResponse.status} (${createProbeMessage})`);
    process.exit(2);
  }

  console.log(
    `⚠️ /user/repos (POST probe) returned unexpected ${createProbeResponse.status}; continuing with caution.`,
  );
}

void main();
