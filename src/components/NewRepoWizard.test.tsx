/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NewRepoWizard } from "./NewRepoWizard";

afterEach(() => {
  cleanup();
});

describe("NewRepoWizard", () => {
  it("blocks next step when required data is missing", () => {
    render(<NewRepoWizard />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Please fix the following before continuing:")).toBeTruthy();
    expect(screen.getByText("Repository name is required.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Details" })).toBeTruthy();
  });

  it("keeps draft values when moving between steps", () => {
    render(<NewRepoWizard />);

    const repoNameInput = screen.getByLabelText("Repository name") as HTMLInputElement;
    fireEvent.change(repoNameInput, { target: { value: "wizard-flow-repo" } });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    const ownerInput = screen.getByLabelText("Owner or organization") as HTMLInputElement;
    fireEvent.change(ownerInput, { target: { value: "bjesuiter" } });

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect((screen.getByLabelText("Repository name") as HTMLInputElement).value).toBe("wizard-flow-repo");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect((screen.getByLabelText("Owner or organization") as HTMLInputElement).value).toBe("bjesuiter");
  });
});
