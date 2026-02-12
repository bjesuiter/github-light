/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NewRepoEntryButton } from "./NewRepoEntryButton";

describe("NewRepoEntryButton", () => {
  it("renders a link to the new repo wizard", () => {
    render(<NewRepoEntryButton />);

    const link = screen.getByRole("link", { name: "New Repo" });

    expect(link.getAttribute("href")).toBe("/new-repo");
  });
});
