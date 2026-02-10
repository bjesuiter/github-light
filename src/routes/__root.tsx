import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { useEffect, useState } from 'react'

import appCss from '../styles.css?url'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5,
    },
  },
})
const queryPersister = createSyncStoragePersister({
  key: 'github-light:query-cache:v1',
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
})
const deployedAt = import.meta.env.VITE_DEPLOYED_AT || 'unknown'
const buildCommitHash = import.meta.env.VITE_BUILD_COMMIT_HASH || 'unknown'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'GitHub Light',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-slate-950 text-slate-100">
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: queryPersister,
            dehydrateOptions: {
              shouldDehydrateQuery: (query) => query.queryKey[0] === 'projects',
            },
          }}
        >
          <AuthControls />
          <div className="pb-16">{children}</div>
          <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 px-4 py-3 text-xs text-slate-400 backdrop-blur">
            <p>
              Deployed on Railway:{' '}
              <time dateTime={deployedAt} className="font-mono">
                {deployedAt}
              </time>{' '}
              (UTC)
            </p>
            <p>
              Commit hash: <span className="font-mono">{buildCommitHash}</span>
            </p>
          </footer>
          {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </PersistQueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}

function AuthControls() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let isCancelled = false

    if (pathname === '/login') {
      setIsLoggedIn(false)
      return () => {
        isCancelled = true
      }
    }

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/get-session', {
          credentials: 'include',
        })

        if (!response.ok) {
          return
        }

        const payload = (await response.json().catch(() => null)) as
          | { session?: unknown }
          | null

        if (!isCancelled && payload?.session) {
          setIsLoggedIn(true)
        }
      } catch {
        // Keep logout button hidden when session lookup fails.
      }
    }

    checkSession()

    return () => {
      isCancelled = true
    }
  }, [pathname])

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
        credentials: 'include',
      })
    } finally {
      window.location.assign('/login')
    }
  }

  if (pathname === '/login' || !isLoggedIn) {
    return null
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="rounded-md border border-slate-700 bg-slate-900/95 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  )
}
