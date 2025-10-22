export default {
  expo: {
    name: "triviaRun",
    slug: "triviaRun",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "triviarun",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#121212",
          dark: {
            backgroundColor: "#121212",
          },
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "This app uses location to track your running distance and pace.",
          locationAlwaysPermission:
            "This app uses location in the background to track your runs.",
          locationWhenInUsePermission:
            "This app uses location to track your running distance and pace.",
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true,
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png",
          color: "#FC4C02",
          defaultChannel: "default",
        },
      ],
      "expo-task-manager",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      stravaClientId: process.env.STRAVA_CLIENT_ID || "your_client_id_here",
      stravaClientSecret: process.env.STRAVA_CLIENT_SECRET || "your_client_secret_here",
    },
  },
};