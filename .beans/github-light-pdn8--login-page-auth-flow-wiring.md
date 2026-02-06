---
# github-light-pdn8
title: Login page + auth flow wiring
status: completed
type: feature
priority: high
created_at: 2026-02-05T21:32:33Z
updated_at: 2026-02-06T10:38:36Z
parent: github-light-uxbi
---

Login route and auth guard wired to Better Auth.

## Checklist
- [x] Login page with GitHub CTA
- [x] Redirect on success to /projects
- [x] Guard /projects when not authenticated

## Verification
- Build: `bun --bun run build` (pass)
- Tests: `bunx vitest run` (pass)
- Dev server: `bgproc start -n github-light-dev -w -- bun --bun run dev` (pass)
