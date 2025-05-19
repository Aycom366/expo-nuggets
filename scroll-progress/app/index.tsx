import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { blogs } from "../constants/blogs";

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Featured Blogs</Text>
      <FlatList
        data={blogs}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={styles.blogItem}
              onPress={() => router.push(`/blog/${item.id}`)}
            >
              <View style={styles.blogHeader}>
                <Image
                  source={{ uri: item.author.avatar }}
                  style={styles.avatar}
                />
                <View style={styles.blogInfo}>
                  <Text style={styles.blogTitle}>{item.title}</Text>
                  <Text style={styles.blogAuthor}>By {item.author.name}</Text>
                </View>
              </View>
              <Text style={styles.blogPreview}>
                {item.content[0].paragraphs[0]}
              </Text>
              <Text style={styles.readTime}>{item.timeToRead} read</Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 20,
    marginHorizontal: 16,
  },
  listContainer: {
    padding: 16,
  },
  blogItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  blogHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  blogInfo: {
    marginLeft: 12,
    flex: 1,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  blogAuthor: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  blogPreview: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  readTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    alignSelf: "flex-end",
  },
});
