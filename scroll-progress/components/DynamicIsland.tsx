import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Blog } from "../constants/blogs";
import ScrollProgress from "./ScrollProgress";

interface DynamicIslandProps {
  blog: Blog;
  scrollProgress: number;
  activeSubsectionIndex: number;
  onMiniMapScroll: (index: number) => void;
}

const { width } = Dimensions.get("window");

const subSectionTitleHeight = 110; //the height of the container
const ITEM_HEIGHT = subSectionTitleHeight / 4;

export function DynamicIsland({
  blog,
  scrollProgress,
  activeSubsectionIndex,
  onMiniMapScroll,
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnimation = useSharedValue(0);
  const opacityAnimation = useSharedValue(1);
  const islandWidth = useSharedValue(0.8 * width);
  const insets = useSafeAreaInsets();
  const miniMapRef = useRef<ScrollView>(null);
  const [isUserScrollingMiniMap, setIsUserScrollingMiniMap] = useState(false);
  const [miniMapCurrentIndex, setMiniMapCurrentIndex] = useState(0);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const interpolatedMinutes = blog.timeToRead * scrollProgress;
  const mins = Math.floor(interpolatedMinutes);
  const secs = Math.floor((interpolatedMinutes - mins) * 60);
  const formattedTime = `${mins}:${secs.toString().padStart(2, "0")}`;

  // Clear any existing timeout to prevent memory leaks
  useEffect(() => {
    return () => {
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, []);

  // Sync minimap scroll position with parent scrollview
  useEffect(() => {
    if (
      isExpanded &&
      miniMapRef.current &&
      !isUserScrollingMiniMap &&
      activeSubsectionIndex !== miniMapCurrentIndex
    ) {
      setMiniMapCurrentIndex(activeSubsectionIndex);

      // Calculate the exact position to scroll to
      const scrollPosition = activeSubsectionIndex * (ITEM_HEIGHT + 10); // ITEM_HEIGHT + gap

      miniMapRef.current.scrollTo({
        y: scrollPosition - 30, // Adjust for paddingVertical to center the item
        animated: true,
      });
    }
  }, [
    activeSubsectionIndex,
    isExpanded,
    isUserScrollingMiniMap,
    miniMapCurrentIndex,
  ]);

  useEffect(() => {
    expandAnimation.value = withTiming(isExpanded ? 1 : 0);
    opacityAnimation.value = withTiming(isExpanded ? 0 : 1);
    islandWidth.value = withTiming(isExpanded ? 0.9 * width : 0.8 * width);
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      expandAnimation.value,
      [0, 1],
      [50, 250],
      Extrapolation.CLAMP
    );

    return {
      height,
      width: islandWidth.value,
    };
  });

  const opacityStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnimation.value,
    };
  });

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMiniMapScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (!isUserScrollingMiniMap) return;

    // Cancel any previous scheduled index change
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
      scrollingTimeoutRef.current = null;
    }

    const offsetY = event.nativeEvent.contentOffset.y;
    // Calculate index accounting for paddings and gaps
    const adjustedOffsetY = offsetY + 30; // Add back the paddingVertical we subtracted
    const index = Math.min(
      Math.max(0, Math.round(adjustedOffsetY / (ITEM_HEIGHT + 10))),
      blog.content.length - 1
    );

    // Only update if index changed
    if (index !== miniMapCurrentIndex) {
      setMiniMapCurrentIndex(index);
    }
  };

  const handleMiniMapScrollBeginDrag = () => {
    setIsUserScrollingMiniMap(true);
  };

  const handleMiniMapScrollEndDrag = () => {
    // Trigger the parent scroll only when the minimap scrolling has completely finished
    // and with the final calculated index
    (scrollingTimeoutRef.current as any) = setTimeout(() => {
      if (miniMapCurrentIndex !== activeSubsectionIndex) {
        onMiniMapScroll(miniMapCurrentIndex);
      }

      // Add a delay before allowing the minimap to be updated by the parent scroll again
      setTimeout(() => {
        setIsUserScrollingMiniMap(false);
      }, 800);
    }, 50);
  };

  return (
    <Animated.View
      style={[
        styles.island,
        {
          bottom: insets.bottom + 10,
          paddingTop: isExpanded ? 20 : 10,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.container}>
        <Pressable onPress={toggleExpand}>
          <Image source={{ uri: blog.author.avatar }} style={styles.avatar} />
        </Pressable>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={isExpanded ? 2 : 1}>
            {blog.title}
          </Text>
          {isExpanded && <Text style={styles.author}>{blog.author.name}</Text>}
        </View>

        <Animated.View style={opacityStyle}>
          <ScrollProgress progress={scrollProgress} size={30} />
        </Animated.View>
      </View>

      {isExpanded && (
        <>
          <View style={{ height: subSectionTitleHeight }}>
            <LinearGradient
              colors={["rgba(0,0,0,1)", "rgba(0,0,0,0)"]}
              style={styles.topGradient}
            />

            <ScrollView
              ref={miniMapRef}
              pagingEnabled={false}
              snapToInterval={ITEM_HEIGHT + 10} // Account for the gap
              decelerationRate='fast'
              contentContainerStyle={{
                paddingVertical: 30,
              }}
              style={styles.miniMap}
              onScroll={handleMiniMapScroll}
              onScrollBeginDrag={handleMiniMapScrollBeginDrag}
              onScrollEndDrag={handleMiniMapScrollEndDrag}
              onMomentumScrollEnd={handleMiniMapScrollEndDrag}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
            >
              {blog.content.map((subsection, index) => (
                <Pressable
                  key={index}
                  style={{
                    height: ITEM_HEIGHT,
                    marginBottom: 10,
                  }}
                  onPress={() => {
                    setMiniMapCurrentIndex(index);
                    setIsUserScrollingMiniMap(true);
                    onMiniMapScroll(index);

                    // Delay before allowing parent scroll to update minimap again
                    setTimeout(() => {
                      setIsUserScrollingMiniMap(false);
                    }, 800);
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.miniMapText,
                      index === miniMapCurrentIndex && styles.activeSubsection,
                    ]}
                  >
                    {subsection.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,1)"]}
              style={styles.bottomGradient}
            />
          </View>

          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={styles.timeToRead}>{formattedTime}</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${scrollProgress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.timeToRead}>{blog.timeToRead}:00</Text>
          </View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  island: {
    position: "absolute",
    alignSelf: "center",
    bottom: 0,
    zIndex: 10,
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: "#000",
    borderRadius: 30,
    paddingVertical: 20,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  author: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 2,
  },
  miniMapContainer: {
    flex: 1,
    position: "relative",
  },
  miniMap: {
    flex: 1,
    paddingHorizontal: 10,
  },
  miniMapText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 24,
    height: subSectionTitleHeight / 4,
    lineHeight: 28,
    fontWeight: 700,
  },
  activeSubsection: {
    color: "#fff", // White color for active subsection
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 2,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 2,
  },
  timeToRead: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
    flex: 1,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#fff",
  },
});
