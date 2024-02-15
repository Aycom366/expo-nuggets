import { useRouter } from "expo-router";
import { FlatList, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const links = [
  {
    name: "Instagram Comments",
    link: "/comment",
  },
  {
    name: "Whatsapp Audio Recording",
    link: "/audio",
  },
] as const;

export default function Page() {
  const router = useRouter();
  return (
    <SafeAreaView>
      <Text className='text-3xl text-center mt-4'>Nuggets</Text>
      <FlatList
        numColumns={2}
        className='h-full py-6'
        contentContainerClassName='mx-2 h-full'
        data={links}
        keyExtractor={(item) => item.link}
        renderItem={({ item }) => (
          <TouchableOpacity
            className='border h-24 px-4 text-center items-center justify-center rounded-lg mx-2 flex-1 bg-slate-300 '
            onPress={() => router.push(item.link as any)}
          >
            <Text className='text-center'>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
