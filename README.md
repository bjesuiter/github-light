# github-light

Naming ideas:
- https://ghx.dev/

## Destructive GitHub lifecycle test

This repo includes a full-circle integration test that:
1. creates a temporary repository,
2. verifies it exists,
3. deletes it again.

The test is intentionally guarded so it does not run accidentally.

```bash
# 1) Permission preflight (non-destructive)
GITHUB_DEV_TOKEN=ghp_xxx bun run test:github-lifecycle:preflight

# 2) Safe default (destructive lifecycle test remains skipped unless armed)
bun run test:github-lifecycle

# 3) Armed mode (runs preflight, then create/check/delete)
RUN_GITHUB_LIFECYCLE_TESTS=true \
ALLOW_GITHUB_DESTRUCTIVE_TESTS=true \
GITHUB_DEV_TOKEN=ghp_xxx \
bun run test:github-lifecycle:armed
```

Optional env:
- `GITHUB_TEST_REPO_PREFIX` (default: `github-light-e2e`)

