import { IComment, ISelectedComment } from "@/app/comment";
import { useRef } from "react";
import { Text, View, findNodeHandle, TextInput, FlatList } from "react-native";
import { Button } from "../shared/Button";

interface IProps extends IComment {
  setSelectedComment: React.Dispatch<React.SetStateAction<ISelectedComment>>;
  inputRef: React.RefObject<TextInput>;
  flatListRef: React.RefObject<FlatList<IComment>>;
}

export const CommentCard = ({
  body,
  id,
  email,
  setSelectedComment,
  flatListRef,
  inputRef,
}: IProps) => {
  /**
   * This ref will be used to get the position of commentCard on the screen
   * With this, we can make calculations based on the position of the commentCard component
   */
  const commentCardRef = useRef<View>(null);

  function getCardPosition() {
    if (commentCardRef.current) {
      /**
       * Measures the layout of the comment card and sets the selected comment state.
       * Also focuses the input field.
       *
       * The measureLayout method is called on the commentCardRef to get the layout measurements
       * relative to the FlatList (obtained using findNodeHandle on the flatListRef).
       *
       * The measurements include the left and top positions, and the width and height of the comment card.
       * These values are then used to set the selected comment state.
       *
       * Finally, the focus method is called on the inputRef to focus the input field.
       */
      commentCardRef.current.measureLayout(
        findNodeHandle(flatListRef.current),
        (left, top, width, height) => {
          setSelectedComment({
            email,
            id,
            top,
            height,
          });
          inputRef.current?.focus();
        }
      );
    }
  }

  return (
    <View ref={commentCardRef} className='gap-1'>
      <View className='rounded-md bg-slate-200 p-2'>
        <Text className='font-bold'>{email}</Text>
        <Text>{body}</Text>
      </View>
      <Button
        onPress={() => {
          getCardPosition();
        }}
        className='self-start'
        text='Reply'
        textClassName='font-bold'
      />
    </View>
  );
};
