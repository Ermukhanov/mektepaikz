import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasLanguage, hasOnboarded } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Gate: language → onboarding → auth → dashboard
    if (typeof window === "undefined") return;
    if (!hasLanguage()) throw redirect({ to: "/language" });
    if (!hasOnboarded()) throw redirect({ to: "/onboarding" });
    // If language + onboarded but no session, _authenticated will bounce to /auth
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
