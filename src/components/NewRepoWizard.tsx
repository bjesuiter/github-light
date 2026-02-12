import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import {
  createDefaultNewRepoDraft,
  normalizeRepoName,
  validateWizardStep,
  type NewRepoDraft,
} from "../lib/new-repo-wizard";

type NewRepoWizardProps = {
  onCreateRepository?: (draft: NewRepoDraft) => Promise<{ htmlUrl?: string; fullName?: string }>;
};

export function NewRepoWizard({ onCreateRepository }: NewRepoWizardProps) {
  const [draft, setDraft] = useState<NewRepoDraft>(() => createDefaultNewRepoDraft());
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailsErrors = useMemo(() => validateWizardStep("details", draft), [draft]);
  const accessErrors = useMemo(() => validateWizardStep("access", draft), [draft]);
  const initializeErrors = useMemo(() => validateWizardStep("initialize", draft), [draft]);

  const hasAnySectionErrors = detailsErrors.length > 0 || accessErrors.length > 0 || initializeErrors.length > 0;

  const handleCreateRepository = async () => {
    setHasAttemptedSubmit(true);
    setSubmitSuccess(null);

    if (hasAnySectionErrors) {
      setSubmitError("Please fix validation errors in the sections above before creating the repository.");
      return;
    }

    if (!onCreateRepository) {
      setSubmitError("Submit action is not wired yet. This page shell is ready for backend wiring.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await onCreateRepository({
        ...draft,
        name: normalizeRepoName(draft.name),
      });

      const locationHint = result.fullName ?? result.htmlUrl ?? "new repository";
      setSubmitSuccess(`Repository created successfully: ${locationHint}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to create repository.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-slate-900/55 p-5 shadow-xl shadow-slate-950/35 sm:p-7">
      <header>
        <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">New Repo</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-100">Complete all sections and create your repository</h2>
        <p className="mt-1 text-sm text-slate-300">
          Fill the form from top to bottom. No stepper clicks required.
        </p>
      </header>

      <div className="mt-6 space-y-5">
        <WizardSection title="1. Details" description="Choose repository name and description.">
          <DetailsStep draft={draft} setDraft={setDraft} />
          {hasAttemptedSubmit ? <SectionErrors errors={detailsErrors} /> : null}
        </WizardSection>

        <WizardSection title="2. Owner & Visibility" description="Select owner and visibility settings.">
          <AccessStep draft={draft} setDraft={setDraft} />
          {hasAttemptedSubmit ? <SectionErrors errors={accessErrors} /> : null}
        </WizardSection>

        <WizardSection
          title="3. Initialize"
          description="Pick optional repository initialization templates for the first commit."
        >
          <InitializeStep draft={draft} setDraft={setDraft} />
          {hasAttemptedSubmit ? <SectionErrors errors={initializeErrors} /> : null}
        </WizardSection>

        <WizardSection title="4. Review" description="Review all values before creating the repository.">
          <ReviewStep draft={draft} />
        </WizardSection>
      </div>

      {submitError ? (
        <p className="mt-5 rounded-lg bg-rose-950/35 p-3 text-sm text-rose-200 ring-1 ring-rose-700/70" role="alert">
          {submitError}
        </p>
      ) : null}

      {submitSuccess ? (
        <p className="mt-5 rounded-lg bg-emerald-950/35 p-3 text-sm text-emerald-200 ring-1 ring-emerald-700/70">
          {submitSuccess}
        </p>
      ) : null}

      <footer className="mt-5 flex flex-wrap items-center gap-2 sm:justify-between">
        <a
          href="/projects"
          className="inline-flex items-center rounded-lg bg-slate-800/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700/80"
        >
          Cancel
        </a>

        <button
          type="button"
          onClick={handleCreateRepository}
          disabled={isSubmitting}
          className="ml-auto rounded-lg bg-cyan-500/25 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating..." : "Create repository"}
        </button>
      </footer>
    </div>
  );
}

function WizardSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-slate-900/65 p-4 shadow-sm shadow-slate-950/20 sm:p-5">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function SectionErrors({ errors }: { errors: Array<string> }) {
  if (!errors.length) {
    return null;
  }

  return (
    <div className="rounded-lg bg-rose-950/40 p-3 text-sm text-rose-200 ring-1 ring-rose-700/70" role="alert">
      <p className="font-medium">Please fix the following:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

function DetailsStep({
  draft,
  setDraft,
}: {
  draft: NewRepoDraft;
  setDraft: Dispatch<SetStateAction<NewRepoDraft>>;
}) {
  return (
    <>
      <label className="block text-sm text-slate-200">
        Repository name
        <input
          value={draft.name}
          onChange={(event) => {
            const nextName = event.target.value;
            setDraft((current) => ({ ...current, name: nextName }));
          }}
          className="mt-1.5 w-full rounded-lg bg-slate-900/80 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700/70 transition focus:ring-cyan-400"
          placeholder="my-awesome-repo"
          autoFocus
        />
      </label>

      <label className="block text-sm text-slate-200">
        Description (optional)
        <textarea
          value={draft.description}
          onChange={(event) => {
            const nextDescription = event.target.value;
            setDraft((current) => ({ ...current, description: nextDescription }));
          }}
          rows={3}
          className="mt-1.5 w-full rounded-lg bg-slate-900/80 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700/70 transition focus:ring-cyan-400"
          placeholder="Small summary of this repo"
        />
      </label>
    </>
  );
}

function AccessStep({
  draft,
  setDraft,
}: {
  draft: NewRepoDraft;
  setDraft: Dispatch<SetStateAction<NewRepoDraft>>;
}) {
  return (
    <>
      <label className="block text-sm text-slate-200">
        Owner or organization
        <input
          value={draft.ownerLogin}
          onChange={(event) => {
            const nextOwner = event.target.value;
            setDraft((current) => ({ ...current, ownerLogin: nextOwner }));
          }}
          className="mt-1.5 w-full rounded-lg bg-slate-900/80 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700/70 transition focus:ring-cyan-400"
          placeholder="your-user-or-org"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm text-slate-200">Visibility</legend>

        <label className="flex items-center gap-2 rounded-lg bg-slate-900/55 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800/70">
          <input
            type="radio"
            name="visibility"
            checked={draft.visibility === "private"}
            onChange={() => {
              setDraft((current) => ({ ...current, visibility: "private" }));
            }}
          />
          Private
        </label>

        <label className="flex items-center gap-2 rounded-lg bg-slate-900/55 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800/70">
          <input
            type="radio"
            name="visibility"
            checked={draft.visibility === "public"}
            onChange={() => {
              setDraft((current) => ({ ...current, visibility: "public" }));
            }}
          />
          Public
        </label>
      </fieldset>
    </>
  );
}

function InitializeStep({
  draft,
  setDraft,
}: {
  draft: NewRepoDraft;
  setDraft: Dispatch<SetStateAction<NewRepoDraft>>;
}) {
  return (
    <>
      <label className="flex items-center gap-2 rounded-lg bg-slate-900/55 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800/70">
        <input
          type="checkbox"
          checked={draft.autoInit}
          onChange={(event) => {
            const checked = event.target.checked;
            setDraft((current) => ({
              ...current,
              autoInit: checked,
              gitignoreTemplate: checked ? current.gitignoreTemplate : "",
              licenseTemplate: checked ? current.licenseTemplate : "",
            }));
          }}
        />
        Initialize repository with an initial commit
      </label>

      <label className="block text-sm text-slate-200">
        .gitignore template (optional)
        <input
          value={draft.gitignoreTemplate}
          disabled={!draft.autoInit}
          onChange={(event) => {
            const nextTemplate = event.target.value;
            setDraft((current) => ({ ...current, gitignoreTemplate: nextTemplate }));
          }}
          className="mt-1.5 w-full rounded-lg bg-slate-900/80 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700/70 transition focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Node"
        />
      </label>

      <label className="block text-sm text-slate-200">
        License template (optional)
        <input
          value={draft.licenseTemplate}
          disabled={!draft.autoInit}
          onChange={(event) => {
            const nextLicense = event.target.value;
            setDraft((current) => ({ ...current, licenseTemplate: nextLicense }));
          }}
          className="mt-1.5 w-full rounded-lg bg-slate-900/80 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700/70 transition focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="mit"
        />
      </label>
    </>
  );
}

function ReviewStep({ draft }: { draft: NewRepoDraft }) {
  return (
    <dl className="grid gap-3 rounded-lg bg-slate-900/55 p-4 text-sm text-slate-200 ring-1 ring-slate-800/70 sm:grid-cols-2">
      <ReviewItem label="Repository name" value={normalizeRepoName(draft.name)} />
      <ReviewItem label="Owner" value={draft.ownerLogin || "-"} />
      <ReviewItem label="Visibility" value={draft.visibility} />
      <ReviewItem label="Initialize" value={draft.autoInit ? "Yes" : "No"} />
      <ReviewItem label=".gitignore" value={draft.gitignoreTemplate || "None"} />
      <ReviewItem label="License" value={draft.licenseTemplate || "None"} />
      <ReviewItem label="Description" value={draft.description || "None"} className="sm:col-span-2" />
    </dl>
  );
}

function ReviewItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-slate-100">{value}</dd>
    </div>
  );
}
