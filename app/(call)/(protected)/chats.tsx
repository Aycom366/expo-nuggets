import { Avatar } from "@/components/chats";
import { Loading } from "@/components/shared/Loading";
import { db } from "@/firebase";
import { IUser, useAuth } from "@/providers/auth";
import { useRouter } from "expo-router";
import { Unsubscribe, collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const { userData } = useAuth();
  const router = useRouter();
  const [isFetchingAllUsersInPlatform, setIsFetchingAllUsersInPlatform] = useState(false);
  const [allUsersInPlatform, setAllUsersInPlatform] = useState([] as IUser[]);

  useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe;
    try {
      setIsFetchingAllUsersInPlatform(true);

      //create a reference to the users collection
      const usersReference = collection(db, "users");

      /**
       * Get all users in the platform except the current user
       * Ideally, you should paginate the users to avoid performance issues
       * This is where infinite scrolling comes in
       * but for the sake of this demo, I'm fetching all users
       */
      const allUsersInThePlatform = query(usersReference, where("uid", "!=", userData.uid));

      unsubscribeSnapshot = onSnapshot(allUsersInThePlatform, (docs) => {
        let chats = [] as IUser[];
        docs.docs.map((doc) => {
          chats.push(doc.data() as IUser);
        });
        setAllUsersInPlatform(chats);
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsFetchingAllUsersInPlatform(false);
    }

    return () => {
      unsubscribeSnapshot && unsubscribeSnapshot();
    };
  }, []);

  if (isFetchingAllUsersInPlatform) return <Loading />;

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-2">
            <Text className="text-lg font-bold text-center">All Users</Text>
          </View>
        }
        data={allUsersInPlatform}
        contentContainerClassName="px-4 py-2 border-b last:border-b-0"
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(call)/(protected)/single-chat",
                  params: {
                    ...item,
                  },
                })
              }
              className="flex-row items-center gap-2"
            >
              <Avatar imageURL={item.photoURL} name={item.name} />
              <Text>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
