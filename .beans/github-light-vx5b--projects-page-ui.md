---
# github-light-vx5b
title: Projects page UI
status: completed
type: feature
priority: high
created_at: 2026-02-05T21:33:05Z
updated_at: 2026-02-06T10:40:49Z
parent: github-light-86bw
---

Render projects grouped by owner with search and metadata.

## Checklist
- [x] Grouped list with ordering rules
- [x] Search by repo and owner
- [x] Show stars, description, updated time
- [x] Repo name links to GitHub (new tab)
- [x] Archived toggle (opt-in)

## Verification
- Build: `bun --bun run build` (pass)
- Tests: `bunx vitest run` (pass)
- Dev server: `bgproc start -n github-light-dev -w -- bun --bun run dev` (pass)
- Browser automation: `agent-browser` CLI not installed; `playwriter` fallback unavailable (no enabled page)
