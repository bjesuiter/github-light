import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">GitHub Light</h1>
        <p className="mt-2 text-slate-300">
          Sign in with GitHub to view your projects.
        </p>
        <form action="/api/auth/sign-in/social" method="post" className="mt-6">
          <input type="hidden" name="provider" value="github" />
          <input type="hidden" name="callbackURL" value="/projects" />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-white"
          >
            Continue with GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
