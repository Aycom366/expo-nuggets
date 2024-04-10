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
  KeyboardEvent,
  useWindowDimensions,
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
  top: number;
  height: number;
}

export default function Page() {
  const { height } = useWindowDimensions();
  const [Comments, setComments] = useState<IComment[]>([] as IComment[]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentValue, setCommentValue] = useState("");

  /**
   * Get the keyboard height that will be used across the app to  make the scrolling smooth
   * It will be best to store this in async storage and get it when the app starts
   */
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  /**
   * This will be used to set the paddingBottom of the flatListContentContainer for IOS
   */
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  /**
   * This will be used to get the height of the comment input container
   * This will be part of the ingredients to make the commentCard stay above the keyboard
   */
  const [commentInputContainerHeight, setCommentInputContainerHeight] =
    useState(120);

  /**
   * This will be used to set focus on input when the reply button is clicked so the keyboard can show up
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
    top: 0,
    height: 0,
  });

  /**
   * Ref for the FlatList
   * This will be passed to flatList renderItem as a prop
   * This will be used to scroll to a specific item
   */
  const flatListRef = useRef<FlatList<IComment>>(null);

  /**
   * Scrolls the FlatList to position the selected comment just above the keyboard.
   *
   * This effect runs whenever the `selectedComment.id` or `keyboardHeight` changes.
   *
   * If `selectedComment.id` is not set, the effect returns early and does nothing.
   *
   * Otherwise, it calculates an offset based on the top position of the selected comment,
   * the window height, the keyboard height, and the height of the selected comment.
   *
   * It then calls `scrollToOffset` on the `flatListRef` to scroll the FlatList to this offset.
   * An additional commentInputContainerHeight pixels are added to the offset to account for the replying container
   */
  useEffect(() => {
    if (!selectedComment.id) return;
    const offset =
      selectedComment.top - (height - keyboardHeight - selectedComment.height);
    flatListRef.current?.scrollToOffset({
      offset: offset + commentInputContainerHeight,
      animated: true,
    });
  }, [selectedComment.id, keyboardHeight, commentInputContainerHeight]);

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

    function onKeyboardDidShow(e: KeyboardEvent) {
      const keyboardHeight = e.endCoordinates.height;
      setKeyboardPadding(keyboardHeight);
      setKeyboardHeight(keyboardHeight);
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

      /**
       * set back the keyboardHeight to 0 when the keyboard is hidden
       * To remove unnecessary space below the last input element
       */
      setKeyboardPadding(0);
    });

    return () => {
      didShowListener.remove();
      didHideListener.remove();
    };
  }, []);

  if (isLoading) return <Loading />;
  if (error) return <Text>{error}</Text>;

  function clearReplyTo() {
    setSelectedComment({ email: "", id: undefined, top: 0, height: 0 });
  }

  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        className='h-full'
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className='flex-1 px-4'>
          <FlatList
            /**
             * For some strange reason, the last 2 to 3 items doesn't show up above the keyboard and this is because there is no enough space to scroll the last item to the top of the keyboard
             * To fix this, we need to add some padding to the bottom of the FlatList to make sure the last item is visible when the keyboard is shown
             * This is only applicable to IOS
             */
            contentContainerStyle={{
              //NB: This doesn't work
              paddingBottom:
                Platform.OS === "ios" ? keyboardPadding : undefined,
            }}
            showsVerticalScrollIndicator={false}
            contentContainerClassName='gap-4'
            ref={flatListRef}
            data={Comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CommentCard
                flatListRef={flatListRef}
                inputRef={inputRef}
                {...item}
                setSelectedComment={setSelectedComment}
              />
            )}
          />
          <View
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setCommentInputContainerHeight(height);
            }}
            className='flex flex-col py-4'
          >
            {selectedComment.email && (
              <View className='w-full flex-row items-center justify-between rounded-md bg-slate-200 px-2 py-4'>
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
            <View className='flex-row items-center gap-1 rounded-md border px-4 '>
              <TextInput
                ref={inputRef}
                value={commentValue}
                onChangeText={setCommentValue}
                placeholder='Write a comment...'
                multiline
                className='h-[40px]  flex-1'
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
