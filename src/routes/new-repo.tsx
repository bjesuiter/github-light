import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { NewRepoWizard } from "@/components/NewRepoWizard";
import { auth } from "@/lib/server/auth";

const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });

  if (session) {
    return session;
  }

  if (import.meta.env.DEV && process.env.GITHUB_DEV_TOKEN?.trim()) {
    return { session: { id: "dev-token" } };
  }

  return null;
});

export const Route = createFileRoute("/new-repo")({
  beforeLoad: async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: NewRepoPage,
});

function NewRepoPage() {
  const pageBackgroundClass = import.meta.env.DEV
    ? "[background-image:repeating-linear-gradient(135deg,rgba(250,204,21,0.045)_0px,rgba(250,204,21,0.045)_10px,transparent_10px,transparent_34px),linear-gradient(to_bottom,#020617,#020617,#0f172a)]"
    : "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900";

  return (
    <div className={`min-h-[calc(100dvh-4rem)] px-4 py-6 text-slate-100 sm:px-6 ${pageBackgroundClass}`}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Create new repository</h1>
          <p className="mt-1.5 text-sm text-slate-300">
            Follow the guided steps to prepare repository settings before creation.
          </p>
        </div>

        <NewRepoWizard />
      </div>
    </div>
  );
}
