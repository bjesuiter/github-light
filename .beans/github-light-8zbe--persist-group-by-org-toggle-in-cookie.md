---
# github-light-8zbe
title: Persist 'group by org' toggle in cookie
status: todo
type: feature
priority: normal
created_at: 2026-02-06T23:51:36Z
updated_at: 2026-02-06T23:51:36Z
---

When the user disables the "group by org" option on the Projects page, persist that preference in a cookie so it survives reloads and new tabs.

## Checklist
- [ ] Add client-side cookie read on page load for the group-by-org preference
- [ ] Update toggle handler to write cookie on change
- [ ] Ensure default behavior remains unchanged when cookie is absent
- [ ] Add/adjust tests for persisted preference behavior

## Verification
- [ ] Turn off "group by org", reload page, confirm setting stays off
- [ ] Turn it back on, reload page, confirm setting stays on