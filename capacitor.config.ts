import type { CapacitorConfig } from "@capacitor/cli";

// PsyDx — Capacitor configuration
// Android-first; iOS can be added later via `npx cap add ios`.
//
// Build pipeline:
//   1. bun run build         # produces dist/
//   2. npx cap sync android  # copies web assets + plugins into the native project
//   3. npx cap open android  # opens Android Studio; Build > Build Bundle(s)/APK(s) > Build APK(s)
//
// During development against a remote dev URL, set the server.url temporarily
// (do NOT ship that to production builds).
const config: CapacitorConfig = {
  appId: "app.psydx.companion",
  appName: "PsyDx",
  webDir: "dist",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  server: {
    androidScheme: "https",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0f1320",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f1320",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3d4a7a",
      sound: "beep.wav",
    },
  },
};

export default config;
