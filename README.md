# github-light

Naming ideas:
- https://ghx.dev/

## Destructive GitHub lifecycle test

This repo includes a full-circle integration test that:
1. creates a temporary repository,
2. verifies it exists,
3. deletes it again.

The test is intentionally guarded so it does not run accidentally.

Environment is loaded through Varlock. Keep real `.env*` files local and gitignored; `.env.schema` is the committed contract.

On JB macOS machines, select the committed JB profile by creating a gitignored `.env.local` with `DEV_ENV=jb`. The committed `.env.jb` file contains resolver refs only; local dev secrets use project/profile-scoped Keychain items with service `varlock` and account `github-light:jb:<ENV_VAR_NAME>`, for example `keychain(service="varlock", account="github-light:jb:GITHUB_CLIENT_SECRET")`. This keeps the exported env var names unchanged while making the selectable Keychain item identity project-specific.

Current Varlock exposes `service` and `account` for `keychain(...)`, but does not expose a prompt API for overriding the Keychain picker heading/title or adding supporting text. Avoid `keychain(prompt)` for this repo because the picker title can still be ambiguous; create/select project-scoped items instead.

For the JB profile, verify Keychain item presence without printing values:

```bash
security find-generic-password -s varlock -a "github-light:jb:BETTER_AUTH_SECRET" >/dev/null
security find-generic-password -s varlock -a "github-light:jb:GITHUB_CLIENT_SECRET" >/dev/null
```

```bash
# 1) Permission preflight (non-destructive)
bun run test:github-lifecycle:preflight

# 2) Safe default (destructive lifecycle test remains skipped unless armed)
bun run test:github-lifecycle

# 3) Armed mode (runs preflight, then create/check/delete)
bun run test:github-lifecycle:armed
```

Optional env:
- `GITHUB_TEST_REPO_PREFIX` (default: `github-light-e2e`)
