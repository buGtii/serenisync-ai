// SPA entry used for the Capacitor / Android mobile build.
// The main web app is rendered via TanStack Start SSR (see src/server.ts).
// This entry produces a static dist-mobile/index.html that Capacitor can package.
import "./styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.mobile.gen";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");
createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
