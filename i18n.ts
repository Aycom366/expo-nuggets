import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

//import the locales for the different languages
import en from "./locales/en.json";
import es from "./locales/es.json";

export const languageResources = {
  en: { translation: en },
  es: { translation: es },
};

i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",

  /**
   * Get the locale used by the device
   */
  lng: Localization.locale,

  /**
   * Set the fallback language in case the device locale is not available
   */
  fallbackLng: "en",

  /**
   * Set the resources to be used by i18next
   * The resources are the translations for the different languages
   */
  resources: languageResources,
});

export default i18next;
