# Running the Audio

- Install `expo-file-system`
- Instal `react-native-audio-recorder-player`
- Add Audio Permission to both android and IOS in app.json

  ```
    "android": {
      "permissions": ["android.permission.RECORD_AUDIO", "android.permission.MODIFY_AUDIO_SETTINGS"],
      ...other config here
    },
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Give $(PRODUCT_NAME) permission to use your microphone. Your record won't be shared without your permission.",
      },
      ...other config here
    },
  ```

- make a development build to make the audio package work using [expo-dev-client](https://docs.expo.dev/develop/development-builds/create-a-build/)
