# PsyDx — Android (Capacitor) Build Guide

This project uses **Capacitor v8** with a committed Android Studio project.
The native `android/` folder now includes the required Gradle and Capacitor
files, including `settings.gradle`, `capacitor.settings.gradle`,
`app/capacitor.build.gradle`, and `app/src/main/assets/capacitor.plugins.json`.

> `capacitor.settings.gradle does not exist`
> `Capacitor could not find the web assets directory "./dist"`

Those errors usually happen when Android Studio is opened before the web app
has been built and synced. Use the commands below from the project root.

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

`android:open` runs `bun run build`, copies the generated web app into
`android/app/src/main/assets/public`, syncs all native plugins, and opens
Android Studio.

For Windows PowerShell, the same command works:

```powershell
bun install
bun run android:open
```

---

## Open in Android Studio

If Android Studio is already open, close it, run `bun run android:sync`, then
re-open the `android/` folder in Android Studio.

Then in Android Studio:
1. Wait for Gradle sync to finish (bottom status bar).
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.
4. For a release APK: **Build → Generate Signed Bundle / APK** (configure
   a keystore the first time).

---

## Every time you change web code

```bash
bun run android:sync
```

(No need to re-run `cap add` — that's a one-time step.)

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
| `capacitor.settings.gradle does not exist` | Pull the latest project files, then run `bun install && bun run android:sync`. This file is now committed under `android/`. |
| `android/app/src/main/assets/capacitor.plugins.json` missing | Run `bun run android:sync`; this regenerates the plugin manifest. |
| `web assets directory "./dist" must contain index.html` | Run `bun run android:sync` instead of `npx cap sync`; it builds `dist/index.html` first. |
| Gradle sync fails on JDK version | In Android Studio: **Settings → Build Tools → Gradle → Gradle JDK → 17**. |
| `SDK location not found` | In Android Studio: **File → Project Structure → SDK Location**, or create `android/local.properties` with `sdk.dir=/path/to/Android/Sdk`. |
| App opens to white screen | You loaded a stale build — re-run `bun run build && bunx cap sync android`. |
