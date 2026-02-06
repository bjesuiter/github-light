---
# github-light-uxbi
title: Auth & sessions
status: completed
type: epic
priority: high
created_at: 2026-02-05T21:30:37Z
updated_at: 2026-02-06T11:26:26Z
parent: github-light-qr6f
---

GitHub OAuth via Better Auth and encrypted cookie sessions.

## Checklist
- [x] Configure Better Auth GitHub provider
- [x] Set env vars and callback URLs
- [x] Ensure encrypted cookie session storage

## Verification
- [x] Child beans completed: `github-light-hq8e`, `github-light-pdn8`
- [x] `bun run build`
- [x] `bunx tsc --noEmit`
- [x] `bun run test` (non-interactive)
