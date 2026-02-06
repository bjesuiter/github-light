---
# github-light-8mdf
title: Scaffold TanStack Start app with Bun
status: completed
type: task
priority: high
created_at: 2026-02-05T21:31:39Z
updated_at: 2026-02-06T10:24:10Z
parent: github-light-vi7d
---

Initialize the app using the TanStack CLI and Bun.

## Checklist
- [x] Run `bunx @tanstack/cli create`
- [x] Verify dev server starts
- [x] Commit generated project files

## Verification
- Build: `bun --bun run build` (pass)
- Tests: `bunx vitest run` (pass)
- Dev server: `bgproc start -n github-light-dev -w -- bun --bun run dev` (pass)
