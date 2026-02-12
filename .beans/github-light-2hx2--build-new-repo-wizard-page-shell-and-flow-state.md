---
# github-light-2hx2
title: Build New Repo wizard page shell and flow state
status: completed
type: feature
priority: high
created_at: 2026-02-09T14:17:32Z
updated_at: 2026-02-12T01:27:52Z
parent: github-light-h9hd
---

Create the dedicated wizard page shell that manages step progression and shared form state across the full flow.

## Checklist
- [x] Add a new route/page for the wizard flow
- [x] Implement step container layout (title, progress indicator, step body, navigation controls)
- [x] Implement shared wizard state model for all steps
- [x] Add next/back transitions with guardrails for invalid/incomplete state
- [x] Preserve draft state while moving between wizard steps

## Verification
- [x] Users can move forward/backward through steps without losing entered data
- [x] Invalid step state blocks progression with clear feedback

## Summary of Changes
- Added new `/new-repo` route with authenticated access guard and wizard page shell.
- Built reusable `NewRepoWizard` component with step layout, progress indicator, step content areas, and next/back navigation controls.
- Added shared draft model + step validation helpers in `src/lib/new-repo-wizard.ts`.
- Added UI tests in `src/components/NewRepoWizard.test.tsx` to verify invalid-step blocking and draft retention across back/next navigation.
- Regenerated router tree to include the new route.
