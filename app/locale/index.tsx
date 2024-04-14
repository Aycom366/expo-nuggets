import { Text, Button, Platform, I18nManager, TextProps } from "react-native";
import * as Updates from "expo-updates";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import i18next from "i18next";
import { cssInterop } from "nativewind";

cssInterop(SafeAreaView, {
  className: "style",
});

const MobileText: React.FC<TextProps> = ({ style, ...rest }) => {
  return <Text style={[{ textAlign: "left" }, style]} {...rest} />;
};

export default function Page() {
  const { t } = useTranslation();

  function changeLanguage() {
    //Get the current language
    const lang = i18next.language;

    //Change the language to the opposite of the current language
    i18next.changeLanguage(lang === "en" ? "es" : "en");

    //If the platform is web, break out of the function
    if (Platform.OS === "web") return;

    //If the language is Arabic or Hebrew, set the direction to RTL
    const shouldBeRTL = ["ar"].includes(lang);

    //Dynamically change the direction of the app based on the language
    if (shouldBeRTL !== I18nManager.isRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);

      //Forcefully reload the app to apply the changes
      Updates.reloadAsync();
    }
  }

  return (
    <SafeAreaView className='flex-1 gap-4 items-center justify-center'>
      <MobileText>{t("greeting")}</MobileText>
      <MobileText>{t("objective")}</MobileText>
      <Button title={t("changeLanguage")} onPress={changeLanguage} />
    </SafeAreaView>
  );
}
