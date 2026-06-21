import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import th from "./locales/th.json";

// react-i18next, configured with the resources we previously hand-rolled.
// Plural suffixes (_one/_other) and {{var}} interpolation are now handled by
// the library's CLDR plural rules instead of our custom useI18n hook.
export const SUPPORTED = ["en", "th"] as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      th: { translation: th },
    },
    lng: "en",
    fallbackLng: "en",
    supportedLngs: SUPPORTED as unknown as string[],
    // Our locale data uses single-brace {var} tokens (carried over from the
    // artifact's hand-rolled i18n), so point i18next's interpolator at them
    // instead of its default {{var}}. Plurals still use the _one/_other keys.
    interpolation: { escapeValue: false, prefix: "{", suffix: "}" },
    returnObjects: false,
  });
}

export default i18n;
