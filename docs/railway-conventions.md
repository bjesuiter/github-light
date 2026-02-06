# Railway Conventions (`bjesuiter.de`)

## Goal
Use one Railway project (`bjesuiter.de`) for many small services with predictable names, envs, and ownership.

## Service Naming
- Default: use the GitHub repository name as the service name.
- If needed, add a prefix only for disambiguation (`api-`, `worker-`, etc.).
- Examples:
  - `github-light` (default)
  - `shortlinks` (default)
  - `worker-rss-sync` (when disambiguation is needed)

## Service Labels (tags/metadata)
- `tier`: `edge` | `api` | `worker` | `cron`
- `owner`: `bjesuiter`
- `runtime`: `bun` | `node` | `python` | `docker`

## Environment Variable Rules
- Project-level shared vars:
  - `RAILWAY_ENV=production`
  - `LOG_LEVEL=info`
- Service-level secrets only:
  - OAuth credentials
  - API keys
  - DB credentials
- Prefix service-specific vars:
  - `GH_LIGHT_*` for this repo/service
  - `SHORTLINKS_*` for shortlinks service

## Domain Strategy
- Public services: one subdomain per service
  - `<service>.bjesuiter.de`
  - Example: `github-light.bjesuiter.de`
- Internal/worker services: no public domain.

## Deployment Defaults
- Branch deploy source: `main`
- Start command from service `package.json`
- Healthcheck endpoint for web/api services:
  - `GET /health` returns `200`

## Minimum Service Checklist
Before adding a new service to `bjesuiter.de`:
1. Service name defaults to the GitHub repository name.
2. `.env.example` exists with required vars.
3. `README.md` has run/build/deploy commands.
4. Healthcheck endpoint implemented (`/health`) for web/api.
5. Custom domain decision recorded (public vs internal).
