import { ActivityIndicator, Text, View } from "react-native";

export const Loading = () => {
  return (
    <View className='flex-1 items-center justify-center'>
      <ActivityIndicator size='large' />
      <Text>Loading...</Text>
    </View>
  );
};
