import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import appCss from '../styles.css?url'

const queryClient = new QueryClient()
const deployedAt = import.meta.env.VITE_DEPLOYED_AT || 'unknown'
const deploymentHash = import.meta.env.VITE_DEPLOYMENT_HASH || 'unknown'

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
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <footer className="border-t border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-400">
            <p>
              Deployed on Railway:{' '}
              <time dateTime={deployedAt} className="font-mono">
                {deployedAt}
              </time>{' '}
              (UTC)
            </p>
            <p>
              Deployment hash: <span className="font-mono">{deploymentHash}</span>
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
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
