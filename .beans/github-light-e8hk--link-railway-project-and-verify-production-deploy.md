---
# github-light-e8hk
title: Link Railway project and verify production deploy
status: completed
type: task
priority: high
created_at: 2026-02-06T10:48:54Z
updated_at: 2026-02-06T11:47:37Z
---

Link this repo to the correct Railway project, set production env vars (APP_BASE_URL, BETTER_AUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET), configure OAuth callback URL, and verify a successful deployment.

## Verification
- Railway status confirms project `bjesuiter.de`, environment `production`, service `github-light`.
- Production env vars are configured for auth and base URL.
- Latest deployment `9fc0183d-18e7-4603-aa9a-0cd6e078181d` is `SUCCESS` (2026-02-06 12:43:49 +01:00).
- Local pre-completion checks passed: `bun run build`, `bun run test`.

## Notes
- Previous blocked state (interactive login/link required) is now resolved.
- OAuth callback is handled by Better Auth at `/api/auth/callback/github` with `basePath: /api/auth` and `APP_BASE_URL` set to production domain.
