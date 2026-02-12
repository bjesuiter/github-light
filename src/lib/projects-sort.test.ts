import { describe, expect, it } from "vitest";

import { sortProjects } from "./projects-sort";

const repos = [
  { name: "gamma", updated_at: "2026-02-01T00:00:00Z" },
  { name: "alpha", updated_at: "2026-02-03T00:00:00Z" },
  { name: "beta", updated_at: "2026-02-02T00:00:00Z" },
];

describe("sortProjects", () => {
  it("sorts by name asc by default mode", () => {
    const sorted = sortProjects(repos, {
      sortMode: "name",
      nameSortDirection: "asc",
      recentSortDirection: "desc",
    });

    expect(sorted.map((repo) => repo.name)).toEqual(["alpha", "beta", "gamma"]);
  });

  it("sorts by recent newest first", () => {
    const sorted = sortProjects(repos, {
      sortMode: "recent",
      nameSortDirection: "asc",
      recentSortDirection: "desc",
    });

    expect(sorted.map((repo) => repo.name)).toEqual(["alpha", "beta", "gamma"]);
  });

  it("sorts by recent oldest first", () => {
    const sorted = sortProjects(repos, {
      sortMode: "recent",
      nameSortDirection: "asc",
      recentSortDirection: "asc",
    });

    expect(sorted.map((repo) => repo.name)).toEqual(["gamma", "beta", "alpha"]);
  });
});
