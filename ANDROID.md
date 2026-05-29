# PsyDx — Android (Capacitor) Build Guide

This project uses **Capacitor v8** with the Android platform. The native
`android/` folder is **intentionally not committed** — it must be generated
locally before opening Android Studio. This is why you may see:

> `capacitor.settings.gradle does not exist`
> `Capacitor could not find the web assets directory "./dist"`

Both errors mean the local one-time setup below was skipped. Follow the
exact order and they go away.

---

## Prerequisites
- **Node 20+** or **Bun 1.x**
- **Android Studio** (Hedgehog or newer) + Android SDK 34+
- **JDK 17** (Android Studio bundles one — make sure it's selected)

---

## One-time setup (run in order, from project root)

```bash
# 1. install JS dependencies
bun install

# 2. PRODUCE THE WEB BUILD (creates dist/index.html — required by cap sync)
bun run build

# 3. Generate the native Android project (creates ./android with
#    capacitor.settings.gradle, build.gradle, etc.)
bunx cap add android

# 4. Copy web assets + native plugins into the Android project
bunx cap sync android
```

If step 3 says `android already exists`, that's fine — skip to step 4.

If step 4 says `web assets directory "./dist" must contain index.html`,
you skipped step 2. Run `bun run build` and retry.

---

## Open in Android Studio

```bash
bunx cap open android
```

Then in Android Studio:
1. Wait for Gradle sync to finish (bottom status bar).
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.
4. For a release APK: **Build → Generate Signed Bundle / APK** (configure
   a keystore the first time).

---

## Every time you change web code

```bash
bun run build && bunx cap sync android
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
| `capacitor.settings.gradle does not exist` | Run `bunx cap add android` (step 3 above). |
| `web assets directory "./dist" must contain index.html` | Run `bun run build` first (step 2). |
| Gradle sync fails on JDK version | In Android Studio: **Settings → Build Tools → Gradle → Gradle JDK → 17**. |
| `SDK location not found` | In Android Studio: **File → Project Structure → SDK Location**, or create `android/local.properties` with `sdk.dir=/path/to/Android/Sdk`. |
| App opens to white screen | You loaded a stale build — re-run `bun run build && bunx cap sync android`. |
