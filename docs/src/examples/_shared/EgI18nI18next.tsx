import i18next from "i18next";
import { useMemo } from "react";
import { initReactI18next, useTranslation } from "react-i18next";
import en from "./i18n/en.json";
import { I18nForm } from "./i18n/form";
import vi from "./i18n/vi.json";

// In an app this lives in your i18n bootstrap file
i18next.use(initReactI18next).init({
  lng: "en",
  resources: { en: { translation: en }, vi: { translation: vi } },
  // the messages use {field}; i18next's default is {{field}}
  interpolation: { escapeValue: false, prefix: "{", suffix: "}" },
});

export default function EgI18nI18next() {
  // `translate` changes with the language. Wrapped because without typed
  // resources its return type also allows objects; a new `t` per language.
  const { t: translate, i18n } = useTranslation();
  const t = useMemo(
    () => (key: string, params?: Record<string, unknown>) => String(translate(key, params)),
    [translate],
  );
  return (
    <I18nForm
      i18nConfig={{ t }}
      config={{
        username: {
          type: "text",
          label: "username_label",
          description: "username_description",
          props: { placeholder: "placeholder_i18next" },
          rules: { required: true, minLength: 3 },
        },
      }}
    >
      <button type="button" onClick={() => i18n.changeLanguage(i18n.language === "en" ? "vi" : "en")}>
        {i18n.language === "en" ? "Tiếng Việt" : "English"}
      </button>
      <button type="submit">Submit</button>
    </I18nForm>
  );
}
