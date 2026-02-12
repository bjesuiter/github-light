---
# github-light-yonn
title: Reduce border-heavy styling in New Repo form
status: completed
type: task
priority: normal
created_at: 2026-02-12T01:45:48Z
updated_at: 2026-02-12T01:49:45Z
---

Simplify the visual design of the new single-page repo flow by reducing decorative borders and relying more on spacing/background contrast.

## Checklist
- [x] Reduce border usage on outer container and section cards
- [x] Reduce border usage on checkbox/radio wrappers and action buttons while keeping affordance clear
- [x] Keep validation/error styling readable and accessible
- [x] Keep tests passing without behavior regressions

## Verification
- [x] New Repo form looks less border-heavy while preserving usability
- [x] Test suite and build pass

## Summary of Changes
- Reduced border-heavy styling in `NewRepoWizard` by removing decorative borders from the outer container and section cards.
- Switched form controls to softer ring-based treatment and simplified option/button wrappers to rely more on spacing/background contrast.
- Kept validation/error states clearly visible with ring-highlighted alert styling.
- Preserved all behavior and submit integration while making the form visually cleaner.
- Verified with `bun run test` and `bun run build`.
