---
# github-light-k5l5
title: Add New Repo entry point on main page
status: completed
type: feature
priority: high
created_at: 2026-02-09T14:17:32Z
updated_at: 2026-02-12T01:29:03Z
parent: github-light-h9hd
---

Add a prominent `New Repo` button on the main/projects page that starts the repository creation workflow.

## Checklist
- [x] Add `New Repo` button in the main page header/actions area
- [x] Route button click to a dedicated wizard URL (for example `/new-repo`)
- [x] Ensure button visibility/placement works on both desktop and mobile layouts
- [x] Add/adjust UI tests for presence and navigation behavior

## Verification
- [x] From the main page, clicking `New Repo` opens the wizard page
- [x] Button remains accessible and correctly styled across responsive breakpoints

## Summary of Changes
- Added `NewRepoEntryButton` component linked to `/new-repo`.
- Added the New Repo entry action to the projects page header with responsive placement.
- Added `NewRepoEntryButton` test coverage to verify button presence and wizard navigation target.
