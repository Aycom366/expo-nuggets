import { Redirect } from "expo-router";
import { Camera } from "react-native-vision-camera";

export default function Page() {
  const cameraPermission = Camera.getCameraPermissionStatus();
  const microphonePermission = Camera.getMicrophonePermissionStatus();
  const showPermissionsPage =
    cameraPermission !== "granted" || microphonePermission === "not-determined";

  if (showPermissionsPage) {
    return <Redirect href='/permission' />;
  }

  return <Redirect href='/camera' />;
}
