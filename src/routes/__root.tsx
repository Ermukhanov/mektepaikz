import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import "@/lib/i18n";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MEKTEP AI — Aqbobek School Director Dashboard" },
      { name: "description", content: "AI-driven school orchestration: smart attendance, voice tasks, substitutions, RAG for orders." },
      { property: "og:title", content: "MEKTEP AI — Aqbobek School Director Dashboard" },
      { property: "og:description", content: "AI-driven school orchestration: smart attendance, voice tasks, substitutions, RAG for orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "MEKTEP AI — Aqbobek School Director Dashboard" },
      { name: "twitter:description", content: "AI-driven school orchestration: smart attendance, voice tasks, substitutions, RAG for orders." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0a15fcf8-3a4c-4aec-8795-8813a6e2bd27/id-preview-c2384a96--fa6a0bf7-6b11-4f44-a187-bb999181dffe.lovable.app-1776438655057.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0a15fcf8-3a4c-4aec-8795-8813a6e2bd27/id-preview-c2384a96--fa6a0bf7-6b11-4f44-a187-bb999181dffe.lovable.app-1776438655057.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icon-192.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <AppShell />;
}
