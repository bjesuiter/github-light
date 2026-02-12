---
# github-light-anoy
title: Add option to sort by recently used (asc/desc)
status: completed
type: feature
priority: normal
created_at: 2026-02-06T23:48:03Z
updated_at: 2026-02-12T01:35:39Z
---

Add a sort control on the Projects page so repositories can be ordered by recent activity in both directions.

## Checklist
- [x] Add UI control to choose "Recently used (newest first)" and "Recently used (oldest first)"
- [x] Apply selected ordering to repository lists within each owner/org group
- [x] Preserve existing filter behavior and ensure sorting composes with search/archived toggles
- [x] Add/adjust tests for sorting behavior

## Verification
- [x] Confirm both sort directions work on the projects page
- [x] Confirm default sort remains unchanged unless the new option is selected

## Summary of Changes
- Added dedicated sort controls for `Recently used (newest)` and `Recently used (oldest)` on the Projects page.
- Introduced reusable sorting helper (`src/lib/projects-sort.ts`) and used it for both grouped and flattened repo lists.
- Kept default sort behavior unchanged (`Name A-Z`) unless users explicitly switch to recent sorting.
- Added tests in `src/lib/projects-sort.test.ts` for name sort, recent newest-first, and recent oldest-first behavior.
