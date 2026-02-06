import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'

import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const deployedAt =
  process.env.RAILWAY_DEPLOYMENT_CREATED_AT ??
  process.env.RAILWAY_DEPLOYMENT_TIMESTAMP ??
  new Date().toISOString()
const deploymentHash = process.env.RAILWAY_DEPLOYMENT_ID ?? 'unknown'

const config = defineConfig({
  define: {
    'import.meta.env.VITE_DEPLOYED_AT': JSON.stringify(deployedAt),
    'import.meta.env.VITE_DEPLOYMENT_HASH': JSON.stringify(deploymentHash),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    devtools(),
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
