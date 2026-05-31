# PsyDx — Android (Capacitor) Build Guide

PsyDx is a TanStack Start SSR web app **and** a Capacitor Android app. The two
builds produce different outputs:

| Build | Command | Output | Used by |
|---|---|---|---|
| Web (SSR) | `bun run build` | `dist/client` + `dist/server` | Cloudflare / Lovable hosting |
| Mobile (SPA) | `bun run build:mobile` | `dist-mobile/index.html` + assets | Capacitor / Android Studio |

The SSR build does **not** produce a static `index.html`, which is why
Capacitor previously failed with `The web assets directory (./dist) must
contain an index.html file`. The mobile build is a separate Vite SPA
pipeline (`vite.config.mobile.ts`) that emits a real static bundle into
`dist-mobile/`, and `capacitor.config.ts` now points `webDir` at that folder.

---

## Prerequisites
- **Node 20+** or **Bun 1.x**
- **Android Studio** (Hedgehog or newer) + Android SDK 34+
- **JDK 17** (Android Studio bundles one — make sure it's selected)

---

## One-command Android setup

```bash
bun install
bun run android:open
```

`android:open` runs `bun run build:mobile`, copies the SPA into
`android/app/src/main/assets/public`, syncs Capacitor plugins, and opens
Android Studio.

On Windows PowerShell the same command works:

```powershell
bun install
bun run android:open
```

---

## Manual workflow (equivalent)

```bash
bun install
bun run build:mobile        # produces dist-mobile/index.html
bunx cap sync android       # copies dist-mobile -> android/app/src/main/assets/public
bunx cap open android       # opens Android Studio
```

Then in Android Studio:
1. Wait for Gradle sync to finish (bottom status bar).
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.
4. For a release APK: **Build → Generate Signed Bundle / APK**.

---

## Every time you change web code

```bash
bun run android:sync
```

This rebuilds `dist-mobile/` and re-copies it into the Android project.
(No need to re-run `cap add` — that's a one-time step.)

---

## Why two builds?

`vite.config.ts` uses `@lovable.dev/vite-tanstack-config`, which wires up
TanStack Start + Nitro and produces an SSR bundle (`dist/server`) plus
hashed client assets (`dist/client`) — **no `index.html`** because every
request is rendered on demand.

Capacitor only ships static files, so we have a parallel SPA build:

- `vite.config.mobile.ts` — plain Vite + `@tanstack/router-plugin` in SPA
  mode, output `dist-mobile/`. It skips `src/routes/api/**` (server-only
  routes that would drag server-only modules into the client bundle).
- `index.html` (repo root) — the mobile bundle's entry document.
- `src/main.tsx` — mounts `<RouterProvider>` against
  `src/routeTree.mobile.gen.ts` (generated on each mobile build).

Note: server functions (`createServerFn`) compiled into the mobile bundle
issue HTTP calls to the same origin. Inside the Capacitor webview that
origin is `https://localhost`, so any server-fn-backed feature (AI chat,
authenticated mutations) requires either pointing the app at a hosted API
via `capacitor.config.ts → server.url`, or rewriting those calls to hit
the deployed `serenisync-ai.lovable.app` API directly. Read-only screens
that only use Supabase from the browser work out of the box.

---

## Installed Capacitor plugins

`@capacitor/app`, `@capacitor/status-bar`, `@capacitor/splash-screen`,
`@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/local-notifications`,
`@capacitor/preferences`, `@capacitor/browser`, `@capacitor/network`,
`@capacitor/share`, `@capacitor/device`.

All are wired into `capacitor.config.ts` with safe defaults. `initMobile()`
in `src/lib/mobile.ts` runs at startup to hide the splash, set status-bar
style, and intercept the Android back button.

---

## App identity
- **App ID:** `app.psydx.companion`
- **App name:** `PsyDx`
- **Min SDK:** Capacitor v8 default (Android 6.0 / API 23+)

To change the launcher icon and splash, replace assets under
`android/app/src/main/res/`. See https://capacitorjs.com/docs/guides/splash-screens-and-icons

---

## Troubleshooting

| Error | Fix |
|---|---|
| `The web assets directory (./dist) must contain an index.html file` | You're on an old script. Use `bun run android:sync` — it runs `build:mobile` and Capacitor reads `dist-mobile/`. |
| `capacitor.settings.gradle does not exist` | Pull latest, then `bun install && bun run android:sync`. This file is committed under `android/`. |
| `android/app/src/main/assets/capacitor.plugins.json` missing | Run `bun run android:sync` to regenerate the plugin manifest. |
| Gradle sync fails on JDK version | **Settings → Build Tools → Gradle → Gradle JDK → 17**. |
| `SDK location not found` | **File → Project Structure → SDK Location**, or create `android/local.properties` with `sdk.dir=/path/to/Android/Sdk`. |
| App opens to white screen | Re-run `bun run android:sync`; check Chrome DevTools (chrome://inspect) for runtime errors. |
