export default {
  expo: {
    name: "expo-nuggets",
    slug: "expo-nuggets",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    scheme: "myapp",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription:
          "Give $(PRODUCT_NAME) permission to use your microphone. Your record won't be shared without your permission.",
      },
      bundleIdentifier: "com.aycom366.exponuggets",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON_INFO,
    },
    android: {
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.aycom366.exponuggets",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "@react-native-google-signin/google-signin",
      [
        "@config-plugins/react-native-webrtc",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "e569b707-c1f2-4bee-a621-9f45547f5a23",
      },
    },
  },
};
