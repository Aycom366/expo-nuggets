import { Image, Text, View } from "react-native";

export const Avatar = ({
  imageURL,
  name,
}: {
  imageURL?: string;
  name: string;
}) => {
  return (
    <>
      {imageURL ? (
        <Image
          source={{ uri: imageURL }}
          className='w-[40px]  h-[40px] rounded-full overflow-hidden'
        />
      ) : (
        <View className='w-[40px] h-[40px] rounded-full overflow-hidden'>
          <Text className='text-center text-lg'>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </>
  );
};
