import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink, Star, Timer } from "lucide-react";

import { auth } from "@/lib/server/auth";

const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
  return auth.api.getSession({ headers: getRequestHeaders() });
});

export const Route = createFileRoute("/projects")({
  beforeLoad: async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProjectsPage,
});

type Repo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  archived: boolean;
  updated_at: string;
  stargazers_count: number;
};

type RepoGroup = {
  owner: {
    login: string;
    type: "User" | "Organization";
    avatarUrl: string;
    isViewer: boolean;
    isOwnOrg: boolean;
  };
  repos: Array<Repo>;
};

type ProjectsResponse = {
  groups: Array<RepoGroup>;
};

function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<ProjectsResponse> => {
      const response = await fetch("/api/projects", { credentials: "include" });
      if (!response.ok) {
        throw new Error(`Failed to load projects (${response.status})`);
      }
      return (await response.json()) as ProjectsResponse;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const projects = projectsQuery.data ?? null;
  const cachedAt = projects ? new Date(projectsQuery.dataUpdatedAt).toISOString() : null;
  const isLoading = projectsQuery.isPending && !projects;
  const isRefreshing = projectsQuery.isFetching;
  const errorMessage = projectsQuery.error instanceof Error ? projectsQuery.error.message : null;
  const hasErrorWithoutCachedData = projectsQuery.isError && !projects;
  const hasErrorWithCachedData = projectsQuery.isError && Boolean(projects);

  const filteredGroups = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    const groups = projects?.groups ?? [];

    return groups
      .map((group) => {
        const repos = group.repos.filter((repo) => {
          if (!showArchived && repo.archived) {
            return false;
          }

          if (!lowerQuery) {
            return true;
          }

          return (
            repo.name.toLowerCase().includes(lowerQuery) ||
            repo.full_name.toLowerCase().includes(lowerQuery) ||
            group.owner.login.toLowerCase().includes(lowerQuery)
          );
        });

        return {
          ...group,
          repos,
        };
      })
      .filter((group) => group.repos.length > 0);
  }, [projects, query, showArchived]);

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-4 py-6 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/55 p-5 shadow-xl shadow-slate-950/30 backdrop-blur-sm sm:p-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">Projects</h1>
          <p className="mt-2 text-slate-300">Find repositories across all accessible owners.</p>
          {isRefreshing ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/80 px-3 py-1 text-sm text-slate-200">
              <svg
                className="h-4 w-4 animate-spin text-slate-200"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-30"
                  fill="none"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-100"
                  fill="none"
                />
              </svg>
              Refreshing repositories...
            </div>
          ) : null}
          {cachedAt && !isRefreshing ? (
            <p className="mt-4 text-xs text-slate-400">
              Showing cached data last refreshed at{" "}
              <time dateTime={cachedAt}>{new Date(cachedAt).toLocaleTimeString()}</time>.
            </p>
          ) : null}

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by repo or owner"
            className="w-full rounded-xl border border-slate-600 bg-slate-800/90 px-4 py-2.5 text-slate-100 placeholder-slate-400 shadow-inner shadow-slate-950/30 outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20"
          />
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
              className="h-4 w-4 rounded border-slate-500 bg-slate-900"
            />
            Show archived
          </label>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Can&apos;t find your repo?{" "}
          <a
            href="https://github.com/settings/installations"
            target="_blank"
            rel="noreferrer noopener"
            className="underline hover:text-slate-200"
          >
            Check permissions here
          </a>{" "}
          and activate the missing user/org.
        </p>

        {isLoading ? (
          <p className="mt-8 text-slate-300">Loading projects...</p>
        ) : null}

        {hasErrorWithoutCachedData || hasErrorWithCachedData ? (
          <p
            className={`mt-8 rounded-lg border p-4 ${
              hasErrorWithCachedData
                ? "border-amber-700 bg-amber-950/30 text-amber-200"
                : "border-red-800 bg-red-950/40 text-red-200"
            }`}
          >
            {hasErrorWithCachedData
              ? `Failed to refresh projects. Showing cached data. (${errorMessage ?? "Unknown error"})`
              : errorMessage ?? "Failed to load projects"}
          </p>
        ) : null}

          {!isLoading && !hasErrorWithoutCachedData && filteredGroups.length === 0 ? (
            <p className="mt-8 text-slate-300">No repositories match your filters.</p>
          ) : null}
        </div>

        <div className="mt-8 space-y-5">
          {filteredGroups.map((group) => (
            <details
              key={group.owner.login}
              open
              className="group overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/50 shadow-lg shadow-slate-950/25"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-slate-700/80 bg-slate-800/45 px-4 py-3.5 marker:content-none transition hover:bg-slate-800/70">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-200">
                    {group.owner.login.slice(0, 1).toUpperCase()}
                  </span>
                  <h2 className="truncate text-lg font-medium text-slate-100">
                    {group.owner.login}
                    <span className="ml-2 text-sm text-slate-400">({group.owner.type})</span>
                    <span className="ml-2 rounded-full bg-slate-700/70 px-2 py-0.5 text-xs text-slate-300">
                      {group.repos.length} repos
                    </span>
                  </h2>
                </div>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul className="divide-y divide-slate-700/70">
                {group.repos.map((repo) => {
                  const updatedAtDate = parseISO(repo.updated_at);
                  const updatedRelative = formatDistanceToNow(updatedAtDate, { addSuffix: true });
                  const updatedExact = format(updatedAtDate, "MMM d, yyyy");

                  return (
                    <li key={repo.id} className="px-4 py-3.5 transition hover:bg-slate-800/45">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 font-medium text-slate-100 hover:text-white hover:underline"
                      >
                        {repo.full_name}
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      </a>
                      <p className="mt-1.5 text-sm text-slate-300/90">
                        {repo.description ?? "No description"}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/70 px-2 py-1">
                          <Star className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                          {repo.stargazers_count}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-slate-700/70 px-2 py-1"
                          title={updatedExact}
                        >
                          <Timer className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                          Updated {updatedRelative}
                        </span>
                        {repo.archived ? (
                          <span className="inline-flex items-center rounded-full bg-amber-900/50 px-2 py-1 text-amber-200">
                            Archived
                          </span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
