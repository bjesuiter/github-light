---
# github-light-f2kt
title: Wire repo creation submit action
status: todo
type: task
priority: high
created_at: 2026-02-09T14:17:32Z
updated_at: 2026-02-09T14:17:32Z
parent: github-light-niil
---

Wire the wizard submit action to the repo creation backend path and implement robust async UX for pending/success/error states.

## Checklist
- [ ] Implement server-side action/API call for repository creation payload
- [ ] Connect final wizard submit to action/API with correct request shape
- [ ] Show in-progress state and prevent duplicate submissions
- [ ] Handle API errors with user-visible recovery guidance
- [ ] Handle success path (confirmation and/or navigation to created repo)

## Verification
- [ ] Successful submit creates a repo and shows a clear success result
- [ ] Failed submit surfaces actionable errors and allows retry
