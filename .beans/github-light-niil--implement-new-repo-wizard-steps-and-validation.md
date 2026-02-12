---
# github-light-niil
title: Implement New Repo wizard steps and validation
status: completed
type: feature
priority: high
created_at: 2026-02-09T14:17:32Z
updated_at: 2026-02-12T01:32:59Z
parent: github-light-h9hd
---

Implement the full multi-step `New Repo` wizard experience, including input validation and final review before submit.

## Checklist
- [x] Define wizard steps and required fields (name, owner/org, visibility, template/init options)
- [x] Implement per-step input UI and validation messages
- [x] Add review/confirmation step summarizing selected options
- [x] Ensure keyboard accessibility and focus management between steps
- [x] Handle cancel/exit behavior from the wizard flow

## Verification
- [x] Each step enforces required fields and displays actionable validation feedback
- [x] Final review accurately reflects all selected values before submission

## Summary of Changes
- Implemented full multi-step wizard flow (`details`, `owner & visibility`, `initialize`, `review`) on `/new-repo`.
- Added per-step validation and actionable error feedback for required fields and invalid combinations.
- Added review step that summarizes all selected values before submit.
- Added keyboard-friendly focus management on step transitions and explicit cancel/exit path back to `/projects`.
- Added/expanded wizard tests to cover progression, validation, and submit behavior end-to-end in non-interactive runs.
