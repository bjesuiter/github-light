---
# github-light-niil
title: Implement New Repo wizard steps and validation
status: todo
type: feature
priority: high
created_at: 2026-02-09T14:17:32Z
updated_at: 2026-02-09T14:17:32Z
parent: github-light-h9hd
---

Implement the full multi-step `New Repo` wizard experience, including input validation and final review before submit.

## Checklist
- [ ] Define wizard steps and required fields (name, owner/org, visibility, template/init options)
- [ ] Implement per-step input UI and validation messages
- [ ] Add review/confirmation step summarizing selected options
- [ ] Ensure keyboard accessibility and focus management between steps
- [ ] Handle cancel/exit behavior from the wizard flow

## Verification
- [ ] Each step enforces required fields and displays actionable validation feedback
- [ ] Final review accurately reflects all selected values before submission
