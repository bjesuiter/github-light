import { z } from "zod";

export const newRepoWizardSteps = ["details", "access", "initialize", "review"] as const;

export type NewRepoWizardStep = (typeof newRepoWizardSteps)[number];
export type RepoVisibility = "private" | "public";

export type NewRepoDraft = {
  name: string;
  description: string;
  ownerLogin: string;
  visibility: RepoVisibility;
  autoInit: boolean;
  gitignoreTemplate: string;
  licenseTemplate: string;
};

export function createDefaultNewRepoDraft(): NewRepoDraft {
  return {
    name: "",
    description: "",
    ownerLogin: "",
    visibility: "private",
    autoInit: true,
    gitignoreTemplate: "",
    licenseTemplate: "",
  };
}

export function normalizeRepoName(name: string): string {
  return name.trim().replace(/\s+/g, "-");
}

const repoNamePattern = /^[A-Za-z0-9._-]+$/;

export function validateWizardStep(step: NewRepoWizardStep, draft: NewRepoDraft): Array<string> {
  switch (step) {
    case "details": {
      const errors: Array<string> = [];
      const normalizedName = normalizeRepoName(draft.name);

      if (!normalizedName) {
        errors.push("Repository name is required.");
      } else if (!repoNamePattern.test(normalizedName)) {
        errors.push("Repository name can only include letters, numbers, dots, dashes, and underscores.");
      }

      return errors;
    }

    case "access": {
      const errors: Array<string> = [];

      if (!draft.ownerLogin.trim()) {
        errors.push("Owner or organization is required.");
      }

      if (!["private", "public"].includes(draft.visibility)) {
        errors.push("Visibility must be either private or public.");
      }

      return errors;
    }

    case "initialize": {
      const errors: Array<string> = [];

      if (!draft.autoInit && (draft.gitignoreTemplate.trim() || draft.licenseTemplate.trim())) {
        errors.push("Template options require initialization to be enabled.");
      }

      return errors;
    }

    case "review": {
      return [
        ...validateWizardStep("details", draft),
        ...validateWizardStep("access", draft),
        ...validateWizardStep("initialize", draft),
      ];
    }

    default:
      return [];
  }
}

export const createRepositoryPayloadSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  ownerLogin: z.string().trim().min(1),
  visibility: z.enum(["private", "public"]),
  autoInit: z.boolean(),
  gitignoreTemplate: z.string().trim().optional(),
  licenseTemplate: z.string().trim().optional(),
});

export type CreateRepositoryPayload = z.infer<typeof createRepositoryPayloadSchema>;
