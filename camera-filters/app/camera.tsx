import { useRef, useState, useCallback } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCameraDevice, useCameraFormat, Camera, useSkiaFrameProcessor } from "react-native-vision-camera";
import { CAPTURE_BUTTON_SIZE, CONTENT_SPACING, CONTROL_BUTTON_SIZE, getSafeAreaPadding } from "@/constants";
import { usePreferredCameraDevice } from "@/hooks/use-preferred-camera";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Skia } from "@shopify/react-native-skia";
import { colorMatrix } from "@/utils/color-matrix";
import { Filters } from "@/components/filters";

export default function CameraPage() {
  const camera = useRef<Camera>(null);
  const router = useRouter();
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">("back");
  const [enableHdr, setEnableHdr] = useState(false);
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [enableNightMode, setEnableNightMode] = useState(false);
  const [filterIndex, setFilterIndex] = useState(0);
  const [showingFilters, setShowingFilters] = useState(false);

  // camera device settings
  const [preferredDevice] = usePreferredCameraDevice();
  let device = useCameraDevice(cameraPosition);
  if (preferredDevice != null && preferredDevice.position === cameraPosition) {
    // override default device with the one selected by the user in settings
    device = preferredDevice;
  }

  const SAFE_AREA_PADDING = getSafeAreaPadding();

  const format = useCameraFormat(device, [{ videoResolution: Dimensions.get("window") }]);

  const supportsFlash = device?.hasFlash ?? false;
  const supportsHdr = format?.supportsPhotoHdr;
  const canToggleNightMode = device?.supportsLowLightBoost ?? false;

  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition((p) => (p === "back" ? "front" : "back"));
  }, []);

  const onFlashPressed = useCallback(() => {
    setFlash((f) => (f === "off" ? "on" : "off"));
  }, []);

  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";
      const colorFilter = Skia.ColorFilter.MakeMatrix(colorMatrix[filterIndex].matrix);
      const paint = Skia.Paint();
      paint.setColorFilter(colorFilter);
      frame.render(paint);
    },
    [filterIndex]
  );

  const videoHdr = format?.supportsVideoHdr && enableHdr;
  const photoHdr = format?.supportsPhotoHdr && enableHdr && !videoHdr;

  const takePhoto = useCallback(async () => {
    try {
      if (camera.current == null) throw new Error("Camera ref is null!");

      const photo = await camera.current.takePhoto({
        flash: flash,
        enableShutterSound: true,
      });
      router.push({
        pathname: "/media",
        params: {
          currentMatrixIndex: filterIndex,
          asset: JSON.stringify({
            ...photo,
            path: "file:///" + photo.path, //vision camera expect us to attach file:/// as said in the docs
          }),
        },
      });
    } catch (e) {
      console.error("Failed to take photo!", e);
    }
  }, [camera, flash]);

  return (
    <View style={styles.container}>
      {device != null ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          ref={camera}
          format={format}
          photoHdr={photoHdr}
          videoHdr={videoHdr}
          photoQualityBalance="balanced"
          lowLightBoost={device.supportsLowLightBoost && enableNightMode}
          enableZoomGesture={false}
          exposure={0}
          enableFpsGraph={true}
          pixelFormat="yuv"
          outputOrientation="device"
          photo={true}
          video={false}
          audio={false}
          frameProcessor={frameProcessor}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.text}>Your phone does not have a Camera.</Text>
        </View>
      )}

      <View
        style={{
          position: "absolute",
          alignSelf: "center",
          gap: 10,
          bottom: SAFE_AREA_PADDING.paddingBottom,
        }}
      >
        {showingFilters && <Filters currentIndex={filterIndex} setCurrentIndex={setFilterIndex} />}
        <TouchableOpacity
          onPress={takePhoto}
          style={{
            alignSelf: "center",
            width: CAPTURE_BUTTON_SIZE,
            height: CAPTURE_BUTTON_SIZE,
            borderRadius: CAPTURE_BUTTON_SIZE / 2,
            borderWidth: 5,
            borderColor: "white",
          }}
        />
      </View>

      <View
        style={[
          styles.rightButtonRow,
          {
            right: SAFE_AREA_PADDING.paddingRight,
            top: SAFE_AREA_PADDING.paddingTop,
          },
        ]}
      >
        <TouchableOpacity style={styles.button} onPress={onFlipCameraPressed}>
          <Ionicons name="camera-reverse" color="white" size={24} />
        </TouchableOpacity>

        {supportsFlash && (
          <TouchableOpacity style={styles.button} onPress={onFlashPressed}>
            <Ionicons name={flash === "on" ? "flash" : "flash-off"} color="white" size={24} />
          </TouchableOpacity>
        )}

        {supportsHdr && (
          <TouchableOpacity style={styles.button} onPress={() => setEnableHdr((h) => !h)}>
            <MaterialCommunityIcons name={enableHdr ? "hdr" : "hdr-off"} color="white" size={24} />
          </TouchableOpacity>
        )}
        {canToggleNightMode && (
          <TouchableOpacity style={styles.button} onPress={() => setEnableNightMode(!enableNightMode)}>
            <Ionicons name={enableNightMode ? "moon" : "moon-outline"} color="white" size={24} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setShowingFilters((prev) => !prev)} style={styles.button}>
          <Ionicons name="color-filter" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/device-page")}>
          <Ionicons name="settings-outline" color="white" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_SIZE / 2,
    backgroundColor: "rgba(140, 140, 140, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  rightButtonRow: {
    position: "absolute",
  },
  text: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
