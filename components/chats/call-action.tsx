import { View, Pressable } from "react-native";
import React, { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface IProps {
  switchCamera: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  endCall: () => void;
}

const CallActionBox = ({ switchCamera, toggleMute, toggleCamera, endCall }: IProps) => {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const onToggleCamera = () => {
    toggleCamera();
    setIsCameraOn(!isCameraOn);
  };
  const onToggleMicrophone = () => {
    toggleMute();
    setIsMicOn(!isMicOn);
  };

  return (
    <View className="pb-6 w-full flex-row px-6 justify-between">
      <Pressable onPress={switchCamera} className="bg-[#F3F3F3] w-[60px] h-[60px] items-center justify-center rounded-full">
        <MaterialIcons name={"flip-camera-ios"} size={30} color="black" />
      </Pressable>
      <Pressable onPress={onToggleCamera} className="bg-[#F3F3F3] w-[60px] h-[60px] items-center justify-center rounded-full">
        <MaterialIcons name={isCameraOn ? "videocam" : "videocam-off"} size={30} color="black" />
      </Pressable>
      <Pressable onPress={onToggleMicrophone} className="bg-[#F3F3F3] w-[60px] h-[60px] items-center justify-center rounded-full">
        <MaterialIcons name={isMicOn ? "mic" : "mic-off"} size={30} color="black" />
      </Pressable>
      <Pressable onPress={endCall} className="bg-red-600 items-center justify-center w-[60px]  h-[60px] rounded-full">
        <MaterialIcons name={"call"} size={30} color="white" />
      </Pressable>
    </View>
  );
};

export default CallActionBox;
