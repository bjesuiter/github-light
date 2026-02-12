/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewRepoWizard } from "./NewRepoWizard";

afterEach(() => {
  cleanup();
});

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Repository name"), {
    target: { value: "wizard-flow-repo" },
  });

  fireEvent.change(screen.getByLabelText("Owner or organization"), {
    target: { value: "bjesuiter" },
  });
}

describe("NewRepoWizard", () => {
  it("renders four vertical sections without next/back stepper controls", () => {
    render(<NewRepoWizard />);

    expect(screen.getByRole("heading", { name: "1. Details" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "2. Owner & Visibility" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "3. Initialize" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "4. Review" })).toBeTruthy();

    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
  });

  it("shows inline section validation when submit is attempted with missing required values", () => {
    render(<NewRepoWizard />);

    fireEvent.click(screen.getByRole("button", { name: "Create repository" }));

    expect(screen.getByText("Repository name is required.")).toBeTruthy();
    expect(screen.getByText("Owner or organization is required.")).toBeTruthy();
    expect(screen.getByText(/Please fix validation errors in the sections above/)).toBeTruthy();
  });

  it("submits successfully without step navigation", async () => {
    const onCreateRepository = vi.fn(async () => ({ fullName: "bjesuiter/wizard-flow-repo" }));

    render(<NewRepoWizard onCreateRepository={onCreateRepository} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Create repository" }));

    expect(await screen.findByText(/Repository created successfully:/)).toBeTruthy();
    expect(onCreateRepository).toHaveBeenCalledTimes(1);
  });

  it("shows API error and allows retry", async () => {
    const onCreateRepository = vi.fn();
    onCreateRepository.mockRejectedValueOnce(new Error("No permission to create repo"));
    onCreateRepository.mockResolvedValueOnce({ fullName: "bjesuiter/wizard-flow-repo" });

    render(<NewRepoWizard onCreateRepository={onCreateRepository} />);

    fillRequiredFields();
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
