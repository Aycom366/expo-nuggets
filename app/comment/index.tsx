import { Loading } from "@/components/shared/Loading";
import { CommentCard } from "@/components/comment/CommentCard";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/shared/Button";
import { AntDesign } from "@expo/vector-icons";

export interface IComment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export interface ISelectedComment {
  email: string;
  id: number | undefined;
}

export default function Page() {
  const [Comments, setComments] = useState<IComment[]>([] as IComment[]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentValue, setCommentValue] = useState("");

  /**
   * This will be used to focus the input when the reply button is clicked so the keyboard can show up
   */
  const inputRef = useRef<TextInput>(null);

  /**
   * State to keep track of the selected comment
   * This will be used to scroll to the selected comment when the reply button is clicked
   *
   */
  const [selectedComment, setSelectedComment] = useState<ISelectedComment>({
    email: "",
    id: undefined,
  });

  /**
   * Ref for the FlatList
   * This will be passed to flatList renderItem as a prop
   * This will be used to scroll to a specific item
   */
  const flatListRef = useRef<FlatList<IComment>>(null);

  /**
   * Fetch comments from the API
   */
  useEffect(() => {
    async function getComments() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          "https://jsonplaceholder.typicode.com/comments"
        );
        const data = await res.json();
        setComments(data.slice(0, 50));
      } catch (error) {
        setError("An error occured");
      } finally {
        setIsLoading(false);
      }
    }
    getComments();

    function onKeyboardDidShow(e: any) {
      //do something
    }

    /**
     * This will listen for the keyboard show and hide event
     * we need to get the keyboard's height and scrollY position, with this we can make the comment we want to reply too stay exactly above the keyboard and visible to the user
     */
    const didShowListener = Keyboard.addListener(
      "keyboardDidShow",
      onKeyboardDidShow
    );
    const didHideListener = Keyboard.addListener("keyboardDidHide", () => {
      /**
       * This will blur the input when the keyboard is hidden
       * This is to make sure the input is not focused when the keyboard is hidden
       */
      inputRef.current?.blur();
    });

    return () => {
      didShowListener.remove();
      didHideListener.remove();
    };
  }, []);

  if (isLoading) return <Loading />;
  if (error) return <Text>{error}</Text>;

  function clearReplyTo() {
    setSelectedComment({ email: "", id: undefined });
  }

  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        className='h-full'
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className=' px-4 flex-1'>
          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerClassName='gap-4 '
            ref={flatListRef}
            data={Comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CommentCard {...item} setSelectedComment={setSelectedComment} />
            )}
          />
          <View className='py-4 flex flex-col'>
            {selectedComment.email && (
              <View className='flex-row py-4 bg-slate-200 px-2 rounded-md w-full justify-between items-center'>
                <Text ellipsizeMode='tail' numberOfLines={1}>
                  Replying to {selectedComment.email}
                </Text>
                <Button
                  onPress={clearReplyTo}
                  iconElement={
                    <AntDesign name='close' size={20} color='black' />
                  }
                />
              </View>
            )}
            <View className='flex-row gap-1 rounded-md items-center border px-4 '>
              <TextInput
                ref={inputRef}
                value={commentValue}
                onChangeText={setCommentValue}
                placeholder='Write a comment...'
                multiline
                className='flex-1  h-[40px]'
              />
              <TouchableOpacity>
                <Text className='font-medium'>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
