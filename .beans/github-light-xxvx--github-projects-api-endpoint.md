---
# github-light-xxvx
title: GitHub projects API endpoint
status: completed
type: feature
priority: high
created_at: 2026-02-05T21:32:49Z
updated_at: 2026-02-06T10:36:25Z
parent: github-light-xbtr
---

Server endpoint to fetch and group repos by owner with ordering rules.

## Checklist
- [x] Fetch user/orgs/repos with pagination
- [x] Capture org roles for ordering (owner/admin)
- [x] Group and sort per SPEC
- [x] Expose `/api/projects` for client

## Verification
- Build: `bun --bun run build` (pass)
- Tests: `bunx vitest run` (pass)
- Dev server: `bgproc start -n github-light-dev -w -- bun --bun run dev` (pass)
