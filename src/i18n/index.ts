import { createI18n } from "vue-i18n";
import en from "./en";
import es from "./es";
import pt from "./pt";

export default createI18n({
  legacy: false,
  locale: "es",
  fallbackLocale: "en",
  messages: {
    en,
    es,
    pt,
  },
});
