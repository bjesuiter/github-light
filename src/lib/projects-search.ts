import { z } from "zod";

export const projectsSearchSchema = z.object({
  s: z.string().optional(),
  filters: z.enum(["open"]).optional(),
  showArchived: z.enum(["true", "false"]).optional(),
  groupByOwner: z.enum(["true", "false"]).optional(),
});

export type ProjectsSearch = z.infer<typeof projectsSearchSchema>;

export function getProjectsQuery(search: ProjectsSearch): string {
  return search.s ?? "";
}

export function withProjectsQuery(prev: ProjectsSearch, nextQuery: string): ProjectsSearch {
  return {
    ...prev,
    s: nextQuery.trim().length > 0 ? nextQuery : undefined,
  };
}
