export type SortMode = "name" | "recent";
export type NameSortDirection = "asc" | "desc";
export type RecentSortDirection = "desc" | "asc";

type SortableRepo = {
  name: string;
  updated_at: string;
};

export function sortProjects<T extends SortableRepo>(
  repos: Array<T>,
  {
    sortMode,
    nameSortDirection,
    recentSortDirection,
  }: {
    sortMode: SortMode;
    nameSortDirection: NameSortDirection;
    recentSortDirection: RecentSortDirection;
  },
): Array<T> {
  return repos.slice().sort((a, b) => {
    if (sortMode === "recent") {
      const comparedRecent = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      return recentSortDirection === "desc" ? comparedRecent : -comparedRecent;
    }

    const comparedName = a.name.localeCompare(b.name);
    return nameSortDirection === "asc" ? comparedName : -comparedName;
  });
}
