import en from "../locales/en.json";
import es from "../locales/es.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "en";
    resources: {
      en: typeof en;
      es: typeof es;
    };
  }
}
