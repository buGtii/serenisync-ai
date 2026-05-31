// Mobile (Capacitor / Android) SPA build.
//
// The web app normally runs as a TanStack Start SSR app (vite.config.ts).
// Capacitor needs a fully static bundle with a real index.html, so this
// separate config emits a plain SPA into dist-mobile/.
//
// Usage:
//   bun run build:mobile        -> produces dist-mobile/index.html
//   bun run android:sync        -> build:mobile + cap sync android
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.mobile.gen.ts",
      // Skip server-only API routes — they import server-only modules and
      // are useless inside a static Capacitor bundle.
      routeFileIgnorePattern: "(^|/)api(/|$)",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Some libraries reference process.env at runtime; keep them happy in the
    // browser bundle without leaking real secrets.
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV ?? "production",
    ),
  },
  build: {
    outDir: "dist-mobile",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: false,
  },
});
