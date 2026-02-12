import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, ChevronDown, Clock3, ExternalLink, Lock, Globe, Star, Timer, RefreshCw } from "lucide-react";

import { getProjectsQuery, projectsSearchSchema, withProjectsQuery, type ProjectsSearch } from "@/lib/projects-search";
import { auth } from "@/lib/server/auth";

const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });

  if (session) {
    return session;
  }

  if (import.meta.env.DEV && process.env.GITHUB_DEV_TOKEN?.trim()) {
    return { session: { id: "dev-token" } };
  }

  return null;
});

export const Route = createFileRoute("/projects")({
  validateSearch: (search): ProjectsSearch => {
    const parsed = projectsSearchSchema.safeParse(search);
    return parsed.success ? parsed.data : {};
  },
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

type SortMode = "name" | "recent";
type NameSortDirection = "asc" | "desc";

function ProjectsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const query = getProjectsQuery(search);
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [nameSortDirection, setNameSortDirection] = useState<NameSortDirection>("asc");

  const isFilterPanelOpen = search.filters === "open";
  const showArchived = search.showArchived === "true";
  const groupByOwner = search.groupByOwner !== "false";

  const setFilterPanelOpen = (nextOpen: boolean) => {
    void navigate({
      search: (prev) => {
        if (nextOpen) {
          return {
            ...prev,
            filters: "open",
          };
        }

        const { filters: _filters, ...rest } = prev;
        return rest;
      },
      replace: true,
    });
  };

  const setShowArchivedInSearch = (nextShowArchived: boolean) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        showArchived: nextShowArchived ? "true" : undefined,
      }),
      replace: true,
    });
  };

  const setGroupByOwnerInSearch = (nextGroupByOwner: boolean) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        groupByOwner: nextGroupByOwner ? undefined : "false",
      }),
      replace: true,
    });
  };

  const setQueryInSearch = (nextQuery: string) => {
    void navigate({
      search: (prev) => withProjectsQuery(prev, nextQuery),
      replace: true,
    });
  };

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

  const handleSortModeChange = (nextMode: SortMode) => {
    if (nextMode === "name") {
      if (sortMode === "name") {
        setNameSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        return;
      }

      setSortMode("name");
      return;
    }

    setSortMode("recent");
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
            .sort((a, b) => {
              if (sortMode === "recent") {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
              }

              const comparedName = a.name.localeCompare(b.name);
              return nameSortDirection === "asc" ? comparedName : -comparedName;
            }),
        };
      })
      .filter((group) => group.repos.length > 0);
  }, [projects, query, showArchived, sortMode, nameSortDirection]);

  const filteredRepos = useMemo<FlattenedRepo[]>(() => {
    const repos = filteredGroups.flatMap((group) =>
      group.repos.map((repo) => ({
        ...repo,
        ownerLogin: group.owner.login,
        ownerType: group.owner.type,
      })),
    );

    return repos.sort((a, b) => {
      if (sortMode === "recent") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }

      const comparedName = a.name.localeCompare(b.name);
      return nameSortDirection === "asc" ? comparedName : -comparedName;
    });
  }, [filteredGroups, sortMode, nameSortDirection]);

  const pageBackgroundClass = import.meta.env.DEV
    ? "[background-image:repeating-linear-gradient(135deg,rgba(250,204,21,0.045)_0px,rgba(250,204,21,0.045)_10px,transparent_10px,transparent_34px),linear-gradient(to_bottom,#0f172a,#0f172a,#1e293b)]"
    : "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800";

  return (
    <div className={`min-h-[calc(100dvh-4rem)] px-4 py-6 text-slate-100 sm:px-6 ${pageBackgroundClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl p-5 sm:p-6">
          <div className="mx-auto max-w-3xl">
            <input
              type="search"
              value={query}
              onChange={(event) => setQueryInSearch(event.target.value)}
              placeholder="Search by repo or owner"
              className="w-full rounded-2xl border border-slate-500/70 bg-transparent px-5 py-3 text-center text-slate-50 placeholder:text-slate-400 outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/25"
            />

            <details
              open={isFilterPanelOpen}
              className="group mt-3 overflow-hidden rounded-xl border border-slate-600/70 bg-slate-800/35"
            >
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  setFilterPanelOpen(!isFilterPanelOpen);
                }}
                className="flex cursor-pointer list-none items-center justify-center px-3 py-2.5 text-center marker:content-none hover:bg-slate-700/25"
              >
                <span className="inline-flex flex-col items-center gap-1 text-xs font-medium tracking-wide text-slate-300">
                  <span>Search/Filter</span>
                  <ChevronDown
                    className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </span>
              </summary>

              <div className="border-t border-slate-700/70 p-3 sm:p-4">
                <SortByPills
                  sortMode={sortMode}
                  nameSortDirection={nameSortDirection}
                  onChange={handleSortModeChange}
                />

                <div className="mt-3 flex flex-wrap items-center gap-3 sm:flex-nowrap">
                  <label className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(event) => setShowArchivedInSearch(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-500 bg-slate-900"
                    />
                    Show archived
                  </label>

                  <label className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={groupByOwner}
                      onChange={(event) => setGroupByOwnerInSearch(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-500 bg-slate-900"
                    />
                    Group by owner
                  </label>

                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700/80 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    {isRefreshing ? "Refreshing..." : "Refresh now"}
                  </button>
                </div>
              </div>
            </details>
          </div>

          {isLoading ? (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="h-2 w-64 overflow-hidden rounded-full bg-slate-700">
                <div className="h-full w-full animate-[loading-bar_1.5s_ease-in-out_infinite] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-[length:200%_100%]" />
              </div>
              <p className="animate-pulse text-sm text-slate-300">Loading projects...</p>
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

        <footer className="mt-8 border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
          <p>
            Find repositories across all accessible owners.
            {cachedAt && !isRefreshing ? (
              <>
                {" "}Showing cached data from{" "}
                <time dateTime={cachedAt}>{new Date(cachedAt).toLocaleTimeString()}</time>.
              </>
            ) : null}
          </p>
          <p className="mt-1.5">
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
        </footer>
      </div>
    </div>
  );
}

function SortByPills({
  sortMode,
  nameSortDirection,
  onChange,
}: {
  sortMode: SortMode;
  nameSortDirection: NameSortDirection;
  onChange: (mode: SortMode) => void;
}) {
  const isNameActive = sortMode === "name";
  const isRecentActive = sortMode === "recent";
  const NameDirectionIcon = nameSortDirection === "asc" ? ArrowUpAZ : ArrowDownAZ;

  return (
    <section>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-200">Sort by</p>
        <p className="text-xs text-cyan-100/70">(Click Name again to toggle A-Z / Z-A)</p>
      </div>
      <div className="mt-2 flex w-full rounded-xl bg-slate-950/60 p-1">
        <button
          type="button"
          onClick={() => onChange("name")}
          aria-pressed={isNameActive}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm transition ${
            isNameActive
              ? "border-cyan-300/45 bg-cyan-400/20 text-cyan-50 shadow-[0_0_10px_rgba(34,211,238,0.24)]"
              : "text-slate-300 hover:bg-slate-800/60"
          }`}
        >
          <NameDirectionIcon className="h-4 w-4" aria-hidden="true" />
          <span>Name ({nameSortDirection === "asc" ? "A-Z" : "Z-A"})</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("recent")}
          aria-pressed={isRecentActive}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm transition ${
            isRecentActive
              ? "border-cyan-300/45 bg-cyan-400/20 text-cyan-50 shadow-[0_0_10px_rgba(34,211,238,0.24)]"
              : "text-slate-300 hover:bg-slate-800/60"
          }`}
        >
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          <span>Recently used</span>
        </button>
      </div>
    </section>
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
