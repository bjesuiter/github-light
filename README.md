# github-light

Naming ideas:
- https://ghx.dev/

## Destructive GitHub lifecycle test

This repo includes a full-circle integration test that:
1. creates a temporary repository,
2. verifies it exists,
3. deletes it again.

The test is intentionally guarded so it does not run accidentally.

Environment is loaded through Varlock. Keep real `.env*` files local and gitignored; `.env.schema` is the committed contract. On JB macOS machines, use `keychain(prompt)` for local secrets such as `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_SECRET`, and `GITHUB_DEV_TOKEN`.

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
