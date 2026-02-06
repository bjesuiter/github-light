---
# github-light-hq8e
title: Configure Better Auth GitHub provider
status: completed
type: feature
priority: high
created_at: 2026-02-05T21:32:13Z
updated_at: 2026-02-06T10:34:13Z
parent: github-light-uxbi
---

Set up Better Auth for GitHub OAuth with encrypted cookie sessions.

## Checklist
- [x] Add Better Auth config
- [x] Configure GitHub provider + scopes
- [x] Enable encrypted cookie sessions
- [x] Set required env vars

## Verification
- Build: `bun --bun run build` (pass)
- Tests: `bunx vitest run` (pass)
- Dev server: `bgproc start -n github-light-dev -w -- bun --bun run dev` (pass)
