import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinueWithGitHub = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          provider: "github",
          callbackURL: "/projects",
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { url?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to start GitHub sign-in.");
      }

      if (!payload?.url) {
        throw new Error("Auth provider redirect URL was not returned.");
      }

      window.location.assign(payload.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start GitHub sign-in.",
      );
      setIsLoading(false);
    }
  };

  const pageBackgroundClass = import.meta.env.DEV
    ? "[background-image:repeating-linear-gradient(135deg,rgba(250,204,21,0.045)_0px,rgba(250,204,21,0.045)_10px,transparent_10px,transparent_34px),linear-gradient(to_bottom,#020617,#020617)]"
    : "bg-slate-950";

  return (
    <div className={`min-h-[calc(100dvh-4rem)] text-slate-100 flex items-center justify-center p-6 ${pageBackgroundClass}`}>
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">GitHub Light</h1>
        <p className="mt-2 text-slate-300">
          Sign in with GitHub to view your projects.
        </p>
        <button
          type="button"
          onClick={handleContinueWithGitHub}
          disabled={isLoading}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Redirecting..." : "Continue with GitHub"}
        </button>
        {error ? (
          <p className="mt-3 text-sm text-rose-300" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
