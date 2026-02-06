import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/server/auth";

const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
  return auth.api.getSession({ headers: getRequestHeaders() });
});

export const Route = createFileRoute("/projects")({
  beforeLoad: async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 text-slate-300">
          Auth wiring is complete. Project list UI comes in the next bean.
        </p>
      </div>
    </div>
  );
}
