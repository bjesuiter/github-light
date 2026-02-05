# SPEC

## Summary
Build a simple TanStack Start app with two pages: a GitHub login page and a projects page. After GitHub OAuth, list all accessible repos grouped by org/user, with a search bar filtering by repo and org/user name. Include a hint for missing repos: `Can't find your repo? Check permissions here and activate the missing user/org`.

## Requirements
- TanStack Start app with two pages:
  - `login`: GitHub OAuth login
  - `projects`: grouped list of repos by org/user
- Projects page:
  - Search bar at the top filters repo names and org/user names
  - Grouped by org/user
  - Only show orgs accessible by the OAuth token
  - Hint for missing repos: `Can't find your repo? Check permissions here and activate the missing user/org`
- Use Bun as package manager and runtime
- Open repo names in a new tab
- Archived repos hidden by default with an opt-in toggle

## Libraries / Stack
- `@tanstack/start` (TanStack Start)
- `@tanstack/router` (routing; Start depends on it but keep explicit)
- `@tanstack/react-query` (data fetching/caching)
- `@tanstack/react-query-persist-client` (optional: persist session data)
- `@tanstack/react-query-devtools` (dev-only debugging)
- `@octokit/rest` (GitHub API client)
- `@octokit/auth-oauth-app` (OAuth flow helper) or direct OAuth endpoints with server route
- `better-auth` (OAuth and session handling, no DB)
- `zod` (input validation)
- `dotenv` (env var loading for local dev)
- `clsx` (class composition)
- `cva` (class variance authority for UI variants)
- `lucide-react` (icons)

## Auth & API Scope
- GitHub OAuth app
- Scopes: `read:user`, `read:org`, `repo` (private repos included by default)
- Only orgs the token can access should appear
- Provide a link to GitHub permissions page for missing orgs
- Use OAuth `state` for CSRF protection and PKCE if supported by chosen flow
- Better Auth configured for no-database usage with encrypted cookie sessions

## Data Model
- `User`:
  - `login`, `id`, `avatar_url`
- `Org`:
  - `login`, `id`, `avatar_url`
- `Repo`:
  - `id`, `name`, `full_name`, `owner.login`, `owner.type`, `private`, `archived`, `fork`, `html_url`, `updated_at`
- Grouping key: `owner.login` (user or org)
- “Own orgs” definition: orgs where the user has `owner` or `admin` role

## Routes / Pages
1. `/login`
   - CTA button: “Continue with GitHub”
   - After success, redirect to `/projects`
2. `/projects`
   - Top search input
   - List grouped by owner (org/user)
   - Archived repos hidden by default with an opt-in toggle
   - Each group shows owner name + repo list
   - Missing repos hint with link to GitHub permissions page
   - Repo entry heading links to GitHub in a new tab
   - Group ordering: user first, then “own orgs”, then other orgs; alphabetical inside each group

## Implementation Plan
1. Scaffold TanStack Start app with Bun
   - Initialize with `bunx @tanstack/cli create`
   - Verify dev server runs
2. Set up env config
   - `.env` for `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `APP_BASE_URL`
3. Implement OAuth flow (Better Auth)
   - Configure Better Auth GitHub provider
   - Use Better Auth routes/handlers for redirect + callback
   - Store token in secure, httpOnly encrypted cookie (server-side)
4. GitHub API integration
   - Create server function to call GitHub:
     - `GET /user`
     - `GET /user/orgs`
     - `GET /user/repos?per_page=100&affiliation=owner,organization_member`
   - Paginate repos to fetch all
   - Capture org role for “own orgs” grouping (from `/user/memberships/orgs` or org membership API)
   - Respect GitHub API rate limits
5. Projects page data query
   - `react-query` fetch from server endpoint `/api/projects`
   - Server groups by owner; client renders groups
6. Search filtering
   - Client-side filtering on repo names and owner names
   - Debounced input
7. UX polish
   - Empty states (no repos, no matches)
   - Missing repos hint with link to GitHub permissions page
   - Repo metadata: stars, description, last updated
   - Repo name is a link opening GitHub in a new tab
   - Archived repos opt-in toggle
   - Loading states and partial data display while paginating
8. QA
   - Validate OAuth flow
   - Validate org visibility matches token permissions
   - Validate sorting/grouping and search filtering logic

## Non-Functional Considerations
- Session storage: cookie-based session or encrypted token cookie; avoid exposing token to client JS
- Security: CSRF protection for OAuth, secure cookies in prod, env var validation
- Rate limits: cache API results per session to minimize GitHub API calls
- Pagination: handle users with 1000+ repos/orgs
- Search behavior: case-insensitive; match owner and repo name
- Accessibility: keyboard navigation, focus states for search and repo links
- Deployment: base URL, callback URL configuration, and HTTPS requirements for OAuth
- Observability: log OAuth errors and GitHub API failures (no token logging)

## Open Questions
- None

## Notes
- Encrypted token cookie: store the GitHub access token in a cookie that is encrypted and signed on the server. The client never sees the raw token, and the server can decrypt it per request. This avoids a database but requires careful key management and secure cookie settings.
