---
# github-light-h9hd
title: New Repo wizard workflow
status: completed
type: epic
priority: high
created_at: 2026-02-09T14:16:50Z
updated_at: 2026-02-12T01:33:31Z
---

Implement a full "New Repo" wizard workflow, triggered by a `New Repo` button on the main page and executed on a dedicated wizard page.

## Checklist
- [x] Add main-page entry point for `New Repo`
- [x] Build wizard route shell and shared flow state
- [x] Implement wizard steps, validation, and review UX
- [x] Wire submit action to repo creation backend flow
- [x] Add automated tests for navigation, validation, and submit outcomes

## Verification
- [x] Child beans completed: `github-light-k5l5`, `github-light-2hx2`, `github-light-niil`
- [x] `github-light-niil` child tasks completed: `github-light-f2kt`, `github-light-5i0c`
- [x] End-to-end flow works from main page button to successful repo creation

## Summary of Changes
- Delivered full New Repo workflow from Projects page entry point to wizard submit.
- Added dedicated `/new-repo` route, shared wizard draft state, step-by-step validation, review, and cancel/back behavior.
- Implemented backend repo creation endpoint (`/api/repos/create`) and wired submit UX with pending, success, error, and retry states.
- Added automated tests for entry navigation, wizard progression, validation, and submit outcomes.
- Confirmed non-interactive validation through `bun run test`, `bun run build`, and armed lifecycle integration create/check/delete tests.
