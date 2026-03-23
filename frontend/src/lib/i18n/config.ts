import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import viCommon from "./locales/vi/common.json";
import jaCommon from "./locales/ja/common.json";

const resources = {
  vi: {
    translation: viCommon,
  },
  ja: {
    translation: jaCommon,
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: "vi",
    supportedLngs: ["vi", "ja"],

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "gem-hr-language",
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
