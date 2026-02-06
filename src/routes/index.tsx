import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/projects" });
  },
  component: IndexRedirect,
});

function IndexRedirect() {
  return null;
}
