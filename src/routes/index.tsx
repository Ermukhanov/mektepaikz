import { createFileRoute, redirect } from "@tanstack/react-router";

// Root path is handled by /_authenticated/ (index inside the protected layout).
// This file is a fallback redirect in case TanStack picks the public root first;
// safe no-op since /_authenticated/ matches "/" and runs the auth gate.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("mektep.lang")) throw redirect({ to: "/language" });
    if (localStorage.getItem("mektep.onboarded") !== "1") throw redirect({ to: "/onboarding" });
    if (!localStorage.getItem("mektep.session")) throw redirect({ to: "/auth" });
  },
  component: () => null,
});
