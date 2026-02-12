import { describe, expect, it } from "vitest";

import { getProjectsQuery, projectsSearchSchema, withProjectsQuery } from "./projects-search";

describe("projects search params", () => {
  it("prefills query from /projects?s=...", () => {
    const parsed = projectsSearchSchema.parse({ s: "github-light" });

    expect(getProjectsQuery(parsed)).toBe("github-light");
  });

  it("uses empty query when s is missing", () => {
    const parsed = projectsSearchSchema.parse({});

    expect(getProjectsQuery(parsed)).toBe("");
  });

  it("removes s when query is blank", () => {
    const next = withProjectsQuery({ filters: "open" }, "   ");

    expect(next.s).toBeUndefined();
  });
});
