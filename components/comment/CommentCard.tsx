import { IComment, ISelectedComment } from "@/app/comment";
import { useRef } from "react";
import { Text, View } from "react-native";
import { Button } from "../shared/Button";

interface IProps extends IComment {
  setSelectedComment: React.Dispatch<React.SetStateAction<ISelectedComment>>;
}

export const CommentCard = ({
  body,
  id,
  email,
  setSelectedComment,
}: IProps) => {
  /**
   * This ref will be used to get the position of commentCard on the screen
   * With this, we can make calculations based on the position of the commentCard component
   */
  const commentCardRef = useRef<View>(null);

  return (
    <View ref={commentCardRef} className='gap-1'>
      <View className='bg-slate-200 rounded-md p-2'>
        <Text className='font-bold'>{email}</Text>
        <Text>{body}</Text>
      </View>

      <Button
        onPress={() =>
          setSelectedComment({
            email,
            id,
          })
        }
        className='self-start'
        text='Reply'
        textClassName='font-bold'
      />
    </View>
  );
};
