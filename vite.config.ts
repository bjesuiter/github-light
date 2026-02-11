import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'
import { execSync } from 'node:child_process'

import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const deployedAt =
  process.env.RAILWAY_DEPLOYMENT_CREATED_AT ??
  process.env.RAILWAY_DEPLOYMENT_TIMESTAMP ??
  new Date().toISOString()
const commitHashFromGit = (() => {
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return null
  }
})()
const buildCommitHash =
  process.env.RAILWAY_GIT_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  process.env.SOURCE_VERSION ??
  commitHashFromGit ??
  'unknown'

const parsedDevtoolsPort = Number(process.env.TANSTACK_DEVTOOLS_PORT ?? '42070')
const devtoolsEventBusPort = Number.isFinite(parsedDevtoolsPort) ? parsedDevtoolsPort : 42070

const config = defineConfig({
  define: {
    'import.meta.env.VITE_DEPLOYED_AT': JSON.stringify(deployedAt),
    'import.meta.env.VITE_BUILD_COMMIT_HASH': JSON.stringify(buildCommitHash),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    devtools({
      eventBusConfig: {
        port: devtoolsEventBusPort,
      },
    }),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
