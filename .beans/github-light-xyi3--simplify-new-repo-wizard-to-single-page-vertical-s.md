---
# github-light-xyi3
title: Simplify New Repo wizard to single-page vertical sections
status: todo
type: feature
priority: high
created_at: 2026-02-12T01:41:08Z
updated_at: 2026-02-12T01:41:08Z
---

Replace the stepper-style New Repo flow with a single vertically scrollable page containing the same four logical sections (Details, Owner & Visibility, Initialize, Review), so users can fill everything without stepping back and forth.

## Checklist
- [ ] Replace step navigation UI with a single-page, top-to-bottom section layout
- [ ] Keep all current fields and validation rules, but show validation inline per section
- [ ] Ensure submit still uses the same backend create endpoint and preserves async UX states
- [ ] Keep cancel/exit behavior and keyboard accessibility
- [ ] Update tests to reflect non-stepper flow interactions

## Verification
- [ ] Users can complete repo creation by scrolling a single page without clicking Next/Back
- [ ] Validation and submit success/error behavior still work as expected
