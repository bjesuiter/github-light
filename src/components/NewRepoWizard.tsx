import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";

import {
  createDefaultNewRepoDraft,
  newRepoWizardSteps,
  normalizeRepoName,
  validateWizardStep,
  type NewRepoDraft,
  type NewRepoWizardStep,
} from "../lib/new-repo-wizard";

type NewRepoWizardProps = {
  onCreateRepository?: (draft: NewRepoDraft) => Promise<{ htmlUrl?: string; fullName?: string }>;
};

const stepLabels: Record<NewRepoWizardStep, string> = {
  details: "Details",
  access: "Owner & Visibility",
  initialize: "Initialize",
  review: "Review",
};

const stepDescriptions: Record<NewRepoWizardStep, string> = {
  details: "Choose repository name and description.",
  access: "Select owner and visibility settings.",
  initialize: "Pick optional repository initialization templates.",
  review: "Review choices before creating the repository.",
};

export function NewRepoWizard({ onCreateRepository }: NewRepoWizardProps) {
  const [draft, setDraft] = useState<NewRepoDraft>(() => createDefaultNewRepoDraft());
  const [stepIndex, setStepIndex] = useState(0);
  const [stepErrors, setStepErrors] = useState<Array<string>>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  const step = newRepoWizardSteps[stepIndex] as NewRepoWizardStep;
  const isFinalStep = step === "review";

  const stepTitle = stepLabels[step];
  const stepDescription = stepDescriptions[step];
  const progressPercent = useMemo(() => ((stepIndex + 1) / newRepoWizardSteps.length) * 100, [stepIndex]);

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [stepIndex]);

  const validateCurrentStep = (): boolean => {
    const errors = validateWizardStep(step, draft);
    setStepErrors(errors);
    return errors.length === 0;
  };

  const goNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setStepErrors([]);
    setStepIndex((current) => Math.min(current + 1, newRepoWizardSteps.length - 1));
  };

  const goBack = () => {
    setStepErrors([]);
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleCreateRepository = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (!onCreateRepository) {
      setSubmitSuccess(null);
      setSubmitError("Submit action is not wired yet. This page shell is ready for backend wiring.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

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
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/35 sm:p-7">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">New Repo Wizard</p>
          <p className="text-sm text-slate-300">
            Step {stepIndex + 1} of {newRepoWizardSteps.length}
          </p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <ol className="grid gap-2 text-xs text-slate-300 sm:grid-cols-4">
          {newRepoWizardSteps.map((entryStep, index) => {
            const isActive = index === stepIndex;
            const isComplete = index < stepIndex;

            return (
              <li
                key={entryStep}
                className={`rounded-lg border px-2 py-1.5 text-center ${
                  isActive
                    ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-100"
                    : isComplete
                      ? "border-emerald-500/50 bg-emerald-600/10 text-emerald-100"
                      : "border-slate-700 bg-slate-800/70"
                }`}
              >
                {stepLabels[entryStep]}
              </li>
            );
          })}
        </ol>
      </header>

      <section className="mt-6 rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 sm:p-5">
        <h2 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold text-slate-100 outline-none">
          {stepTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-300">{stepDescription}</p>

        <div className="mt-5 space-y-4">
          {step === "details" ? <DetailsStep draft={draft} setDraft={setDraft} /> : null}
          {step === "access" ? <AccessStep draft={draft} setDraft={setDraft} /> : null}
          {step === "initialize" ? <InitializeStep draft={draft} setDraft={setDraft} /> : null}
          {step === "review" ? <ReviewStep draft={draft} /> : null}
        </div>

        {stepErrors.length ? (
          <div className="mt-5 rounded-lg border border-rose-700/70 bg-rose-950/40 p-3 text-sm text-rose-200" role="alert">
            <p className="font-medium">Please fix the following before continuing:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {stepErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {submitError ? (
          <p className="mt-5 rounded-lg border border-rose-700/70 bg-rose-950/35 p-3 text-sm text-rose-200" role="alert">
            {submitError}
          </p>
        ) : null}

        {submitSuccess ? (
          <p className="mt-5 rounded-lg border border-emerald-700/70 bg-emerald-950/35 p-3 text-sm text-emerald-200">
            {submitSuccess}
          </p>
        ) : null}
      </section>

      <footer className="mt-5 flex flex-wrap items-center gap-2 sm:justify-between">
        <a
          href="/projects"
          className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
        >
          Cancel
        </a>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0 || isSubmitting}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>

          {isFinalStep ? (
            <button
              type="button"
              onClick={handleCreateRepository}
              disabled={isSubmitting}
              className="rounded-lg border border-cyan-500/60 bg-cyan-500/20 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create repository"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg border border-cyan-500/60 bg-cyan-500/20 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/30"
            >
              Next
            </button>
          )}
        </div>
      </footer>
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
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
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
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
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
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
          placeholder="your-user-or-org"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm text-slate-200">Visibility</legend>

        <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
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

        <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
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
      <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
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
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
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
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="mit"
        />
      </label>
    </>
  );
}

function ReviewStep({ draft }: { draft: NewRepoDraft }) {
  return (
    <dl className="grid gap-3 rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-200 sm:grid-cols-2">
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
