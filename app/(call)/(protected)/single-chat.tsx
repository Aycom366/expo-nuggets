import { Avatar } from "@/components/chats";
import { IUser } from "@/providers/auth";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Page() {
  const userObject = useLocalSearchParams() as unknown as IUser;
  const [messages, setMessages] = useState([] as IMessage[]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const onSend = useCallback((messages = [] as IMessage[]) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  function call(type: "audio" | "video") {
    router.push({
      pathname: "/(call)/(protected)/call",
      params: {
        ...userObject,
        type,
      },
    });
  }

  return (
    <View className='flex-1'>
      <View
        className='px-4 flex-row items-center border-b border-black/10 pb-4 justify-between'
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className='flex-row items-center gap-2'>
          <Avatar imageURL={userObject.photoURL} name={userObject.name} />
          <Text>{userObject.name}</Text>
        </View>
        <View className='flex-row gap-4 items-center'>
          <TouchableOpacity onPress={() => call("audio")}>
            <Ionicons name='call-outline' size={24} color='black' />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => call("video")}>
            <Feather name='video' size={24} color='black' />
          </TouchableOpacity>
        </View>
      </View>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
        }}
      />
    </View>
  );
}
