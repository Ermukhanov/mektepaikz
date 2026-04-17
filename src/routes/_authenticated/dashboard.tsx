import { createFileRoute } from "@tanstack/react-router";
import Overview from "./_authenticated/index";

// /dashboard alias for the authenticated home view (kept inside the layout)
export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Overview,
});
