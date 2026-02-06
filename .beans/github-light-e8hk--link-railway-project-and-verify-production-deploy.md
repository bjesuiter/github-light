---
# github-light-e8hk
title: Link Railway project and verify production deploy
status: todo
type: task
priority: high
tags:
    - blocked
created_at: 2026-02-06T10:48:54Z
updated_at: 2026-02-06T10:49:27Z
blocking:
    - github-light-d1t9
---

Link this repo to the correct Railway project, set production env vars (APP_BASE_URL, BETTER_AUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET), configure OAuth callback URL, and verify a successful deployment.

## Blocked
- Reason: Railway project linkage requires authenticated interactive setup (`railway login` / `railway link`) that is not available in unattended mode.
- Unblock: run `railway login` and `railway link` for the target project, then rerun beansloop.
