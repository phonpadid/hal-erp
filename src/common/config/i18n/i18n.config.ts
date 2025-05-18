import { createI18n } from "vue-i18n";
import en  from "../../locales/en.json"
import la  from "../../locales/la.json"
const locale = localStorage.getItem("locale") || "en";
const i18nConfig = createI18n({
  legacy: false,
  locale: locale,
  fallbackLocale: "en",
  messages: {
    en: en,
    la: la
  }
});
export default i18nConfig;
