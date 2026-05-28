import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.mindscape.companion",
  appName: "Mindscape Companion",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3d4a7a",
    },
  },
};

export default config;
