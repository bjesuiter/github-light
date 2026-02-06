---
# github-light-ix0y
title: Add React Query devtools
status: completed
type: task
priority: low
created_at: 2026-02-05T21:31:55Z
updated_at: 2026-02-06T10:48:16Z
parent: github-light-vi7d
---

Add @tanstack/react-query-devtools for local debugging (dev-only).

## Checklist
- [x] Install devtools package
- [x] Render Devtools only in dev

## Verification
- Build: `bun --bun run build` (pass)
- Tests: `bunx vitest run` (pass)
- Dev server: `bgproc start -n github-light-dev -w -- bun --bun run dev` (pass)
