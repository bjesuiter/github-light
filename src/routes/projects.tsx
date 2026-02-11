import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink, Lock, Globe, Star, Timer, RefreshCw } from "lucide-react";

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
  private: boolean;
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

type FlattenedRepo = Repo & {
  ownerLogin: string;
  ownerType: RepoGroup["owner"]["type"];
};

function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [groupByOwner, setGroupByOwner] = useState(true);
  const [sortMode, setSortMode] = useState<"name" | "recent">("name");

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<ProjectsResponse> => {
      const response = await fetch(`/api/projects`, { credentials: "include" });
      if (!response.ok) {
        throw new Error(`Failed to load projects (${response.status})`);
      }
      return (await response.json()) as ProjectsResponse;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
  });

  const projects = projectsQuery.data ?? null;
  const cachedAt = projects ? new Date(projectsQuery.dataUpdatedAt).toISOString() : null;
  const isLoading = projectsQuery.isPending && !projects;
  const isRefreshing = projectsQuery.isFetching;
  const errorMessage = projectsQuery.error instanceof Error ? projectsQuery.error.message : null;
  const hasErrorWithoutCachedData = projectsQuery.isError && !projects;
  const hasErrorWithCachedData = projectsQuery.isError && Boolean(projects);

  const handleManualRefresh = () => {
    void projectsQuery.refetch();
  };

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
          repos: repos
            .slice()
            .sort((a, b) =>
              sortMode === "recent"
                ? new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                : a.name.localeCompare(b.name),
            ),
        };
      })
      .filter((group) => group.repos.length > 0);
  }, [projects, query, showArchived, sortMode]);

  const filteredRepos = useMemo<FlattenedRepo[]>(() => {
    const repos = filteredGroups.flatMap((group) =>
      group.repos.map((repo) => ({
        ...repo,
        ownerLogin: group.owner.login,
        ownerType: group.owner.type,
      })),
    );

    return repos.sort((a, b) =>
      sortMode === "recent"
        ? new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        : a.name.localeCompare(b.name),
    );
  }, [filteredGroups, sortMode]);

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
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh now"}
          </button>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-200">
            Sort by
            <span className="relative inline-flex items-center">
              <select
                value={sortMode}
                onChange={(event) =>
                  setSortMode(event.target.value === "recent" ? "recent" : "name")
                }
                className="appearance-none rounded-lg border border-slate-500/70 bg-slate-900/80 py-1 pl-3 pr-8 text-sm text-slate-100 shadow-inner outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="name">Name (A-Z)</option>
                <option value="recent">Recently used</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-400" />
            </span>
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
              className="h-4 w-4 rounded border-slate-500 bg-slate-900"
            />
            Show archived
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={groupByOwner}
              onChange={(event) => setGroupByOwner(event.target.checked)}
              className="h-4 w-4 rounded border-slate-500 bg-slate-900"
            />
            Group by owner
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
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="h-2 w-64 overflow-hidden rounded-full bg-slate-700">
              <div className="h-full w-full animate-[loading-bar_1.5s_ease-in-out_infinite] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-[length:200%_100%]" />
            </div>
            <p className="text-sm text-slate-300 animate-pulse">Loading projects...</p>
          </div>
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

          {!isLoading &&
          !hasErrorWithoutCachedData &&
          (groupByOwner ? filteredGroups.length === 0 : filteredRepos.length === 0) ? (
            <p className="mt-8 text-slate-300">No repositories match your filters.</p>
          ) : null}
        </div>

        {groupByOwner ? (
          <div className="mt-8 space-y-5">
            {filteredGroups.map((group) => (
              <details
                key={group.owner.login}
                open
                className="group overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/50 shadow-lg shadow-slate-950/25"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-slate-700/80 bg-slate-800/45 px-4 py-3.5 marker:content-none transition hover:bg-slate-800/70">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={group.owner.avatarUrl}
                      alt={`${group.owner.login} avatar`}
                      className="h-8 w-8 rounded-full border border-slate-600/80 object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
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
                  {group.repos.map((repo) => (
                    <ProjectListItem key={repo.id} repo={repo} />
                  ))}
                </ul>
              </details>
            ))}
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/50 shadow-lg shadow-slate-950/25">
            <ul className="divide-y divide-slate-700/70">
              {filteredRepos.map((repo) => (
                <ProjectListItem
                  key={repo.id}
                  repo={repo}
                  ownerLabel={`${repo.ownerLogin} (${repo.ownerType})`}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectListItem({ repo, ownerLabel }: { repo: Repo; ownerLabel?: string }) {
  const updatedAtDate = parseISO(repo.updated_at);
  const updatedRelative = formatDistanceToNow(updatedAtDate, { addSuffix: true });
  const updatedExact = format(updatedAtDate, "MMM d, yyyy");

  return (
    <li className="px-4 py-3.5 transition hover:bg-slate-800/45">
      <a
        href={repo.html_url}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 font-medium text-slate-100 hover:text-white hover:underline"
      >
        {repo.full_name}
        <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      </a>
      <p className="mt-1.5 text-sm text-slate-300/90">{repo.description ?? "No description"}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
        {ownerLabel ? (
          <span className="inline-flex items-center rounded-full bg-slate-700/70 px-2 py-1">
            {ownerLabel}
          </span>
        ) : null}
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
        {repo.private ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-900/50 px-2 py-1 text-red-200">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Private
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-900/50 px-2 py-1 text-green-200">
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            Public
          </span>
        )}
      </div>
    </li>
  );
}
