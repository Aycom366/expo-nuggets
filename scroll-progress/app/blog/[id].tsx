import { DynamicIsland } from "@/components/DynamicIsland";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { blogs } from "../../constants/blogs";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

export default function BlogDetail() {
  const { id } = useLocalSearchParams();
  const blog = blogs.find((b) => b.id === id)!;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSubsectionIndex, setActiveSubsectionIndex] = useState(0);
  const [subsectionOffsets, setSubsectionOffsets] = useState<number[]>([]);
  const mainScrollRef = useRef<ScrollView>(null);

  // Calculate subsection offsets once blog content is available
  useEffect(() => {
    if (blog) {
      // Calculate more accurate offset estimates based on font sizes and line heights
      // These will be refined with onLayout in the actual component

      // Header content height (fixed)
      const headerHeight = 28 + 8 + 16 + 4 + 14 + 24; // title + margins + author + margins + timeToRead + bottom margin

      // Calculate approximate heights based on content and styles
      const offsets = blog.content.reduce<number[]>(
        (acc, subsection, index) => {
          // Get previous height or use header height for first section
          const previousHeight = index === 0 ? headerHeight : acc[index - 1];

          // Subsection title height: font size + margins
          const titleHeight = 20 + 24 + 12; // fontSize + marginTop + marginBottom

          // Calculate paragraph heights based on content length and line height
          const avgCharsPerLine = 60; // Estimate based on font size and container width
          const lineHeight = 24;

          // Calculate approximate paragraph heights
          const paragraphsHeight = subsection.paragraphs.reduce(
            (height, paragraph) => {
              // Estimate number of lines based on text length
              const lines = Math.ceil(paragraph.length / avgCharsPerLine);
              // Add paragraph height + bottom margin
              return height + lines * lineHeight + 16; // line height * lines + marginBottom
            },
            0
          );

          // Total estimated height for this subsection
          const estimatedHeight =
            previousHeight + titleHeight + paragraphsHeight;
          acc.push(estimatedHeight);
          return acc;
        },
        []
      );

      setSubsectionOffsets(offsets);
    }
  }, [blog]);

  // Handle scrolling on the main content ScrollView
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPosition = contentOffset.y;

    // Calculate overall scroll progress
    const progress =
      scrollPosition / (contentSize.height - layoutMeasurement.height);
    setScrollProgress(Math.max(0, Math.min(1, progress)));

    // Determine which subsection is currently in view
    if (subsectionOffsets.length > 0) {
      // Find which section should be considered "active"
      // A section becomes active when it's at halfway into the viewport (top half of screen)
      let newActiveIndex = 0;
      const viewportMidpoint = scrollPosition + WINDOW_HEIGHT / 4;

      for (let i = 0; i < subsectionOffsets.length; i++) {
        if (subsectionOffsets[i] <= viewportMidpoint) {
          newActiveIndex = i;
        } else {
          break;
        }
      }

      if (newActiveIndex !== activeSubsectionIndex) {
        setActiveSubsectionIndex(newActiveIndex);
      }
    }
  };

  // Handle scrolling initiated from minimap
  const handleMiniMapScroll = (index: number) => {
    if (subsectionOffsets.length > 0 && mainScrollRef.current) {
      setActiveSubsectionIndex(index);

      // Scroll the main content to the selected subsection
      mainScrollRef.current.scrollTo({
        y: subsectionOffsets[index],
        animated: true,
      });
    }
  };

  // Track layout of each subsection to get accurate offsets
  const updateSubsectionOffset = (index: number, y: number) => {
    setSubsectionOffsets((prevOffsets) => {
      const newOffsets = [...prevOffsets];
      newOffsets[index] = y;
      return newOffsets;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <DynamicIsland
        blog={blog}
        scrollProgress={scrollProgress}
        activeSubsectionIndex={activeSubsectionIndex}
        onMiniMapScroll={handleMiniMapScroll}
      />

      <ScrollView
        ref={mainScrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{blog.title}</Text>
        <Text style={styles.author}>By {blog.author.name}</Text>
        <Text style={styles.timeToRead}>{blog.timeToRead} min read</Text>

        <View style={styles.content}>
          {blog.content.map((subsection, index) => (
            <View
              key={index}
              onLayout={(event) => {
                updateSubsectionOffset(index, event.nativeEvent.layout.y);
              }}
            >
              <Text style={styles.subsectionTitle}>{subsection.title}</Text>
              {subsection.paragraphs.map((paragraph, pIndex) => (
                <Text key={pIndex} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 250,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  timeToRead: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
  },
  content: {
    marginBottom: 40,
  },
  subsectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
});
