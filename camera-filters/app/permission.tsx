import React, { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import { StyleSheet, View, Text, Image } from "react-native";
import type { CameraPermissionStatus } from "react-native-vision-camera";
import { Camera } from "react-native-vision-camera";
import { useRouter } from "expo-router";
import { CONTENT_SPACING, getSafeAreaPadding } from "@/constants";

export default function PermissionsPage() {
  const router = useRouter();
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState<CameraPermissionStatus>("not-determined");
  const [microphonePermissionStatus, setMicrophonePermissionStatus] =
    useState<CameraPermissionStatus>("not-determined");

  const requestMicrophonePermission = useCallback(async () => {
    console.log("Requesting microphone permission...");
    const permission = await Camera.requestMicrophonePermission();
    console.log(`Microphone permission status: ${permission}`);

    if (permission === "denied") await Linking.openSettings();
    setMicrophonePermissionStatus(permission);
  }, []);

  const requestCameraPermission = useCallback(async () => {
    console.log("Requesting camera permission...");
    const permission = await Camera.requestCameraPermission();
    console.log(`Camera permission status: ${permission}`);

    if (permission === "denied") await Linking.openSettings();
    setCameraPermissionStatus(permission);
  }, []);

  useEffect(() => {
    if (
      cameraPermissionStatus === "granted" &&
      microphonePermissionStatus === "granted"
    )
      router.replace("/camera");
  }, [cameraPermissionStatus, microphonePermissionStatus]);

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: "white",
          ...getSafeAreaPadding(),
        },
      ]}
    >
      <Text style={styles.welcome}>Welcome to{"\n"}Vision Camera.</Text>
      <View style={styles.permissionsContainer}>
        {cameraPermissionStatus !== "granted" && (
          <Text style={styles.permissionText}>
            Vision Camera needs{" "}
            <Text style={styles.bold}>Camera permission</Text>.{" "}
            <Text style={styles.hyperlink} onPress={requestCameraPermission}>
              Grant
            </Text>
          </Text>
        )}
        {microphonePermissionStatus !== "granted" && (
          <Text style={styles.permissionText}>
            Vision Camera needs{" "}
            <Text style={styles.bold}>Microphone permission</Text>.{" "}
            <Text
              style={styles.hyperlink}
              onPress={requestMicrophonePermission}
            >
              Grant
            </Text>
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 38,
    fontWeight: "bold",
    maxWidth: "80%",
  },

  permissionsContainer: {
    marginTop: CONTENT_SPACING * 2,
  },
  permissionText: {
    fontSize: 17,
  },
  hyperlink: {
    color: "#007aff",
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },
});
