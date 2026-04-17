import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("mektep.lang")) {
      throw redirect({ to: "/language" });
    }
    if (localStorage.getItem("mektep.onboarded") !== "1") {
      throw redirect({ to: "/onboarding" });
    }
    if (!localStorage.getItem("mektep.session")) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
