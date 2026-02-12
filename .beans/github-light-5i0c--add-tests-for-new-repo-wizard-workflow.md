---
# github-light-5i0c
title: Add tests for New Repo wizard workflow
status: in-progress
type: task
priority: normal
created_at: 2026-02-09T14:17:32Z
updated_at: 2026-02-12T01:22:33Z
parent: github-light-niil
---

Add automated test coverage for the end-to-end wizard flow and key failure cases.

## Checklist
- [ ] Add route-level test for `New Repo` button -> wizard navigation
- [ ] Add wizard progression tests for next/back behavior and draft state retention
- [ ] Add validation tests for required fields per step
- [x] Add submit tests for both success and failure outcomes
- [x] Ensure tests run non-interactively in CI-compatible mode

## Verification
- [ ] Test suite covers happy path and major validation/error paths
- [x] All new tests pass reliably in non-interactive runs

## Progress Notes
- Added `src/lib/github-repo-lifecycle.test.ts` for destructive create -> verify -> delete lifecycle coverage against the GitHub API.
- Added guarded scripts in `package.json`: `test:github-lifecycle` and `test:github-lifecycle:armed`.
- Running armed mode with current token returns `403 Resource not accessible by personal access token` during create, indicating missing repo-create permission for this PAT.

- Added `scripts/github-lifecycle-preflight.ts` plus `test:github-lifecycle:preflight` to detect missing GitHub create permissions before destructive tests.
- Wired `test:github-lifecycle:armed` to run preflight first, then lifecycle test only when preflight passes.

- Added AGENTS.md testing guardrails for lifecycle tests, including mandatory preflight and explicit rule: never delete repos not created in the current test run.

- Re-ran armed lifecycle test after permission update: preflight passed and full create -> verify -> delete test passed successfully.
