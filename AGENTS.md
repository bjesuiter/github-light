# AGENTS.md

## Rules
- Use the `bgproc` skill to start development servers so process lifecycle is managed (`start`, `status`, `logs`, `stop`).
- Use the `agent-browser` skill to run browser tests autonomously without requiring user interaction.
- Use the `playwrighter` skill to run browser tests collaboratively with the user when explicitly requested.
- When using `beansloop`, always use non-interactive testing.
- Prod deployment is linked to this GitHub repo; to test, push the latest changes and wait for the Railway deploy to finish.

### Remote Coding Mode
- Always use `agent-browser` skill for seeing the page in a browser.
- After changing things, commit and push them, wait for Railway status to get to "successfully deployed", then check GitHub.bjesuiter.de with browser to see if the change worked.

## Tech Stack
- Runtime/package manager: `bun`
- App framework: `@tanstack/react-start` (TanStack Start, file-based routes)
- Router: `@tanstack/react-router` + `@tanstack/router-plugin`
- UI: `react@19`, `react-dom@19`
- Styling: `tailwindcss@4` + `@tailwindcss/vite`
- Build/dev tooling: `vite@7`, `@vitejs/plugin-react`, `vite-tsconfig-paths`
- Server/runtime adapter: `nitro` (`npm:nitro-nightly`)
- Testing: `vitest`, `@testing-library/react`, `jsdom`
- Icons/devtools: `lucide-react`, TanStack devtools packages

## Project Structure
- `.beans/`: beans issue tracker files used by `beansloop`
- `.output/`: generated build output (client and server artifacts)
- `.tanstack/`: TanStack generated temporary files
- `public/`: static assets served as-is
- `src/`: application source code
- `src/routes/`: file-based routes (`__root.tsx`, `index.tsx`, and demo routes)
- `src/components/`: shared UI components
- `src/data/`: local data/demo data modules
- `src/routeTree.gen.ts`: generated TanStack route tree
- `package.json`: scripts and dependency definitions
- `vite.config.ts`: Vite + TanStack + Nitro plugin configuration
- `tsconfig.json`: TypeScript settings
- `railway.json`: Railway build/deploy configuration
