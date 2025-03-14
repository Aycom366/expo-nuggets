import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import { Alert, Button, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCameraPermissions } from "expo-camera";
import { ThemedText } from "@/components/ThemedText";

export default function WebViewScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView>
        <ThemedText>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title='grant permission' />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        startInLoadingState
        javaScriptCanOpenWindowsAutomatically
        allowsInlineMediaPlayback
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);

          switch (data.event) {
            case "Liveness_SDK_Initialized":
              console.warn("liveness initialized");
              break;

            case "Error_Creating_Session":
              console.warn("couldn't create session");
              break;

            case "User_Cancel":
              console.warn("user close verification");
              Alert.alert("User has asked to close verification!");
              break;

            case "Analysis_Complete":
              const response = JSON.stringify(data.data);
              router.push({ pathname: "/result", params: { data: response } });
              break;

            case "Error_Fetching_Result":
              console.warn("couldn't fetch result");
              break;

            case "OnError":
              const errorResponse = data.data;
              console.error("Error:", errorResponse);
              Alert.alert("Error", errorResponse?.error?.message);

              break;

            default:
              break;
          }
        }}
        style={{ flex: 1 }}
        source={{ uri: "https://a033-105-119-1-143.ngrok-free.app" }}
      />
    </SafeAreaView>
  );
}
