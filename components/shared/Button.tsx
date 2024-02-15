import { cn } from "@/utils/functions/cn";
import {
  Text,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

type PropsWithText = {
  text: string;
  textClassName: TextProps["className"];
  iconElement?: React.ReactNode;
};

type PropsWithoutText = {
  text?: never;
  textClassName?: never;
  iconElement?: React.ReactNode;
};

type IProps = (PropsWithText | PropsWithoutText) & TouchableOpacityProps;

export const Button = ({
  text,
  iconElement,
  textClassName,
  ...props
}: IProps) => {
  return (
    <TouchableOpacity {...props}>
      {text && <Text className={cn("text-center", textClassName)}>{text}</Text>}
      {iconElement && iconElement}
    </TouchableOpacity>
  );
};
