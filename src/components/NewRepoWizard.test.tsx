/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewRepoWizard } from "./NewRepoWizard";

afterEach(() => {
  cleanup();
});

function moveToReviewStep() {
  fireEvent.change(screen.getByLabelText("Repository name"), {
    target: { value: "wizard-flow-repo" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));

  fireEvent.change(screen.getByLabelText("Owner or organization"), {
    target: { value: "bjesuiter" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));

  fireEvent.click(screen.getByRole("button", { name: "Next" }));
}

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

  it("requires owner selection before leaving access step", () => {
    render(<NewRepoWizard />);

    fireEvent.change(screen.getByLabelText("Repository name"), {
      target: { value: "wizard-flow-repo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Owner or organization is required.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Owner & Visibility" })).toBeTruthy();
  });

  it("shows success feedback after a successful submit", async () => {
    const onCreateRepository = vi.fn(async () => ({ fullName: "bjesuiter/wizard-flow-repo" }));

    render(<NewRepoWizard onCreateRepository={onCreateRepository} />);

    moveToReviewStep();
    fireEvent.click(screen.getByRole("button", { name: "Create repository" }));

    expect(await screen.findByText(/Repository created successfully:/)).toBeTruthy();
    expect(onCreateRepository).toHaveBeenCalledTimes(1);
  });

  it("shows API error feedback and allows retry", async () => {
    const onCreateRepository = vi.fn();
    onCreateRepository.mockRejectedValueOnce(new Error("No permission to create repo"));
    onCreateRepository.mockResolvedValueOnce({ fullName: "bjesuiter/wizard-flow-repo" });

    render(<NewRepoWizard onCreateRepository={onCreateRepository} />);

    moveToReviewStep();
    fireEvent.click(screen.getByRole("button", { name: "Create repository" }));

    expect(await screen.findByText("No permission to create repo")).toBeTruthy();

    const createButton = screen.getByRole("button", { name: "Create repository" });
    expect(createButton.getAttribute("disabled")).toBeNull();

    fireEvent.click(createButton);

    await waitFor(() => {
      expect(onCreateRepository).toHaveBeenCalledTimes(2);
    });
  });
});
