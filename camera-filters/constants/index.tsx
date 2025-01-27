import { Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const getSafeAreaPadding = () => {
  const insets = useSafeAreaInsets();

  const SAFE_BOTTOM =
    Platform.select({
      ios: insets.bottom,
      android: 0,
    }) ?? 0;

  return {
    paddingLeft: insets.left + CONTENT_SPACING,
    paddingTop: insets.top + CONTENT_SPACING,
    paddingRight: insets.right + CONTENT_SPACING,
    paddingBottom: SAFE_BOTTOM + CONTENT_SPACING,
  };
};

export const CONTENT_SPACING = 15;

// The maximum zoom _factor_ you should be able to zoom in
export const MAX_ZOOM_FACTOR = 10;

export const SCREEN_WIDTH = Dimensions.get("window").width;

export const getScreenHeight = () => {
  const insets = useSafeAreaInsets();
  const SCREEN_HEIGHT = Platform.select<number>({
    android: Dimensions.get("screen").height - insets.bottom,
    ios: Dimensions.get("window").height,
  }) as number;

  return SCREEN_HEIGHT;
};

// Capture Button
export const CAPTURE_BUTTON_SIZE = 78;

// Control Button like Flash
export const CONTROL_BUTTON_SIZE = 40;
