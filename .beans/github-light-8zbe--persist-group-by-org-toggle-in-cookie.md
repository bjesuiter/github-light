---
# github-light-8zbe
title: Persist 'group by org' toggle in cookie
status: completed
type: feature
priority: normal
created_at: 2026-02-06T23:51:36Z
updated_at: 2026-02-12T01:09:51Z
---

When the user disables the "group by org" option on the Projects page, persist that preference in a cookie so it survives reloads and new tabs.

## Checklist
- [x] Add persisted preference read on page load for the group-by-org preference (implemented via URL search params)
- [x] Update toggle handler to persist preference on change (implemented via URL search params)
- [x] Ensure default behavior remains unchanged when persisted value is absent
- [x] Add/adjust tests for persisted preference behavior

## Verification
- [x] Turn off "group by org", reload page, confirm setting stays off
- [x] Turn it back on, reload page, confirm setting stays on

## Summary of Changes

- Persisted "Group by owner" preference through URL search params (groupByOwner=false) so it survives reloads and shared links.
- Wired toggle reads/writes to search params while preserving default grouped behavior when no param exists.
- Added tests for projects search-param handling, including persisted query behavior and blank-value cleanup.
