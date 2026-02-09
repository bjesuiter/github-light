---
# github-light-5i0c
title: Add tests for New Repo wizard workflow
status: todo
type: task
priority: normal
created_at: 2026-02-09T14:17:32Z
updated_at: 2026-02-09T14:17:32Z
parent: github-light-niil
---

Add automated test coverage for the end-to-end wizard flow and key failure cases.

## Checklist
- [ ] Add route-level test for `New Repo` button -> wizard navigation
- [ ] Add wizard progression tests for next/back behavior and draft state retention
- [ ] Add validation tests for required fields per step
- [ ] Add submit tests for both success and failure outcomes
- [ ] Ensure tests run non-interactively in CI-compatible mode

## Verification
- [ ] Test suite covers happy path and major validation/error paths
- [ ] All new tests pass reliably in non-interactive runs
