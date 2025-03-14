import { ThemedText } from "@/components/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Result() {
  const { data } = useLocalSearchParams();
  const parsedData = JSON.parse(decodeURIComponent(data as string));

  return (
    <SafeAreaView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ThemedText>Liveness Check Result</ThemedText>
      <View>
        <ThemedText>Confidence: {parsedData.Confidence}</ThemedText>
      </View>
    </SafeAreaView>
  );
}
