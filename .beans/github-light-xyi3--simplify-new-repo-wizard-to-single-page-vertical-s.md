---
# github-light-xyi3
title: Simplify New Repo wizard to single-page vertical sections
status: completed
type: feature
priority: high
created_at: 2026-02-12T01:41:08Z
updated_at: 2026-02-12T01:43:42Z
---

Replace the stepper-style New Repo flow with a single vertically scrollable page containing the same four logical sections (Details, Owner & Visibility, Initialize, Review), so users can fill everything without stepping back and forth.

## Checklist
- [x] Replace step navigation UI with a single-page, top-to-bottom section layout
- [x] Keep all current fields and validation rules, but show validation inline per section
- [x] Ensure submit still uses the same backend create endpoint and preserves async UX states
- [x] Keep cancel/exit behavior and keyboard accessibility
- [x] Update tests to reflect non-stepper flow interactions

## Verification
- [x] Users can complete repo creation by scrolling a single page without clicking Next/Back
- [x] Validation and submit success/error behavior still work as expected

## Summary of Changes
- Reworked `NewRepoWizard` from stepper navigation to a single vertically scrollable form with four stacked sections: Details, Owner & Visibility, Initialize, and Review.
- Removed Next/Back flow and replaced it with direct top-to-bottom editing plus one final Create action.
- Kept existing validation rules and now display validation inline within each section after submit is attempted.
- Preserved backend submit integration (`/api/repos/create`) and async UX states (creating, success, error, retry).
- Retained cancel behavior (`/projects`) and keyboard-friendly labeled controls.
- Updated tests to validate the non-stepper layout and submit/validation behavior.
