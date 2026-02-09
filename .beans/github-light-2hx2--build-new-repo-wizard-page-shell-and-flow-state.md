---
# github-light-2hx2
title: Build New Repo wizard page shell and flow state
status: todo
type: feature
priority: high
created_at: 2026-02-09T14:17:32Z
updated_at: 2026-02-09T14:17:32Z
parent: github-light-h9hd
---

Create the dedicated wizard page shell that manages step progression and shared form state across the full flow.

## Checklist
- [ ] Add a new route/page for the wizard flow
- [ ] Implement step container layout (title, progress indicator, step body, navigation controls)
- [ ] Implement shared wizard state model for all steps
- [ ] Add next/back transitions with guardrails for invalid/incomplete state
- [ ] Preserve draft state while moving between wizard steps

## Verification
- [ ] Users can move forward/backward through steps without losing entered data
- [ ] Invalid step state blocks progression with clear feedback
