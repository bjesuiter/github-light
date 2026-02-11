---
# github-light-bvac
title: Render stale projects while background refresh runs (GH-5)
status: completed
type: bug
priority: high
created_at: 2026-02-11T22:57:20Z
updated_at: 2026-02-11T23:00:52Z
---

GitHub issue #5: Projects list currently blocks rendering during refresh. Keep previously fetched projects visible (stale data) while invalidating and refetching in background so UI stays populated.

## Summary of Changes

- Updated the shared React Query client config to keep query data in cache for 24 hours using gcTime.
- Set query persistence maxAge to the same 24-hour window to align restore and garbage-collection behavior.
- This allows the projects page to render cached stale data and refresh in the background instead of forcing a blocking cold load after inactivity.
- Verified with bun test and bun run build.
