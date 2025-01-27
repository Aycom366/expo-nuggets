import { Filters } from "@/components/filters";
import { ThemedText } from "@/components/ThemedText";
import { colorMatrix } from "@/utils/color-matrix";
import { Canvas, ColorMatrix, Image, SkImage, useImage } from "@shopify/react-native-skia";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PhotoFile } from "react-native-vision-camera";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

export default function Page() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const skiaRef = useRef<any>(undefined); //ref for the canvas
  const searchParams = useLocalSearchParams();
  const asset: PhotoFile = JSON.parse(searchParams.asset as string);

  /**
   * the index of the filter array that is currently selected from the camera screen
   * By default, vision camera `takePicture` method does not capture the filter automatically, so we have to capture without filter, then reapply the filter during camera preview
   */
  const [filterIndex, setFilterIndex] = useState(Number(searchParams.currentMatrixIndex));
  const [savingImage, setSavingImage] = useState(false);
  const [canvasHeight, setCanvasHeight] = useState(200); //just a random height, canvas onLayout will override this
  const image = useImage(asset.path);

  const handleSave = async () => {
    if (permissionResponse?.status !== "granted") {
      return await requestPermission();
    }
    setSavingImage(true);
    try {
      /**@link https://shopify.github.io/react-native-skia/docs/canvas/overview/ */
      const image: SkImage = await skiaRef.current?.makeImageSnapshotAsync();
      if (image) {
        const base64 = image.encodeToBase64();
        const uri = FileSystem.documentDirectory + "sketch.png";
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await MediaLibrary.saveToLibraryAsync(uri);
        setSavingImage(false);
        alert("Image Saved!");
      }
    } catch (error) {
      console.error("error", error);
    } finally {
      setSavingImage(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 10 }}>
      {/* show skia canvas instead of the original image */}
      <Canvas onLayout={(e) => setCanvasHeight(e.nativeEvent.layout.height)} ref={skiaRef} collapsable={false} style={{ flex: 1 }}>
        <Image width={Dimensions.get("screen").width} height={canvasHeight} x={0} y={0} image={image} fit="contain">
          {/* To know more about this, pleas visit https://shopify.github.io/react-native-skia/docs/color-filters */}
          <ColorMatrix matrix={colorMatrix[filterIndex].matrix} />
        </Image>
      </Canvas>

      <View style={{ gap: 15 }}>
        <Filters filterIndex={filterIndex} setFilterIndex={setFilterIndex} />
        <TouchableOpacity disabled={savingImage} onPress={handleSave} style={{ alignSelf: "center", backgroundColor: "green", padding: 10, borderRadius: 10 }}>
          <ThemedText> {savingImage ? "Saving..." : "Save Image"}</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
