---
# github-light-d1t9
title: Railway deployment configuration
status: completed
type: task
priority: low
created_at: 2026-02-05T21:33:20Z
updated_at: 2026-02-06T11:47:44Z
---

Prepare Railway deployment settings and OAuth callback URLs.

## Checklist
- [x] Set Railway env vars
- [x] Configure production callback URL
- [x] Verify deploy works

## Verification
- `railway status` confirms linked project/environment/service in production.
- Production env vars for auth are configured.
- Better Auth callback path is `/api/auth/callback/github` via `basePath: /api/auth` and production `APP_BASE_URL`.
- `railway deployment list` shows latest deployment `9fc0183d-18e7-4603-aa9a-0cd6e078181d` with `SUCCESS`.
- Local verification passed: `bun run build`, `bun run test`.

## Notes
- Original blocked condition is resolved.
