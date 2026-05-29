# Android (Capacitor) — PsyDx

This project ships with Capacitor v8 + Android platform configured. The Android
project is generated locally — it is NOT committed to the repo. Generate it on
your machine before opening Android Studio.

## Prerequisites
- Node 20+ or Bun 1.x
- Android Studio (Hedgehog or newer) with Android SDK 34+
- JDK 17

## One-time setup

```bash
bun install
bun run build               # creates dist/
bunx cap add android        # creates ./android (only the first time)
bunx cap sync android       # copies web assets + native plugins
```

## Open in Android Studio

```bash
bunx cap open android
```

In Android Studio:
- Let Gradle finish syncing
- **Build → Build Bundle(s) / APK(s) → Build APK(s)** to produce a debug APK at
  `android/app/build/outputs/apk/debug/app-debug.apk`
- For a release APK: configure signing in Android Studio, then
  **Build → Generate Signed Bundle / APK**

## Iterating

Every time you change web code:

```bash
bun run build && bunx cap sync android
```

## Installed plugins

`@capacitor/app`, `@capacitor/status-bar`, `@capacitor/splash-screen`,
`@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/local-notifications`,
`@capacitor/preferences`, `@capacitor/browser`, `@capacitor/network`,
`@capacitor/share`, `@capacitor/device`.

All are wired into `capacitor.config.ts` with safe defaults. `initMobile()` in
`src/lib/mobile.ts` is called once at startup to hide the splash, set status
bar style, and intercept the Android back button.

## App identity
- App ID: `app.psydx.companion`
- App name: `PsyDx`
- Min SDK: defaults from Capacitor v8 (Android 6.0 / API 23+)

## Crisis-resource icon
The launcher icon and splash should be replaced with your branded assets in
`android/app/src/main/res/`. Capacitor docs:
https://capacitorjs.com/docs/guides/splash-screens-and-icons
