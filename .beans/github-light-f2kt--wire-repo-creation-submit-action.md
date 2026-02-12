---
# github-light-f2kt
title: Wire repo creation submit action
status: completed
type: task
priority: high
created_at: 2026-02-09T14:17:32Z
updated_at: 2026-02-12T01:31:41Z
parent: github-light-niil
---

Wire the wizard submit action to the repo creation backend path and implement robust async UX for pending/success/error states.

## Checklist
- [x] Implement server-side action/API call for repository creation payload
- [x] Connect final wizard submit to action/API with correct request shape
- [x] Show in-progress state and prevent duplicate submissions
- [x] Handle API errors with user-visible recovery guidance
- [x] Handle success path (confirmation and/or navigation to created repo)

## Verification
- [x] Successful submit creates a repo and shows a clear success result
- [x] Failed submit surfaces actionable errors and allows retry

## Summary of Changes
- Added server route `POST /api/repos/create` that validates payloads and creates repositories for user or organization owners via the GitHub API.
- Wired `/new-repo` page submit action to `/api/repos/create` with full request payload handling.
- Kept wizard async UX states for in-progress (`Creating...` + disabled action), success result messaging, and actionable API error hints.
- Expanded wizard tests to cover submit success and failure/retry behaviors.
- Re-ran armed lifecycle integration test (preflight + create/check/delete) successfully after submit wiring.
