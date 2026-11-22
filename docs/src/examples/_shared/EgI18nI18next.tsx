import i18next from "i18next";
import { useCallback } from "react";
import { initReactI18next, useTranslation } from "react-i18next";
import { Form } from "./form.setup";

// In an app this lives in your i18n bootstrap file
i18next.use(initReactI18next).init({
  lng: "en",
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: {
        "username.label": "Username",
        "username.description": "Your public display name",
        "validation.required": "{{field}} is required",
        "validation.minLength": "{{field}} must be at least {{minLength}} characters",
      },
    },
    vi: {
      translation: {
        "username.label": "Tên người dùng",
        "username.description": "Tên hiển thị công khai của bạn",
        "validation.required": "{{field}} là bắt buộc",
        "validation.minLength": "{{field}} phải có ít nhất {{minLength}} ký tự",
      },
    },
  },
});

export default function EgI18nI18next() {
  // `t` changes with the language: labels and shown errors follow it
  const { i18n, t: translate } = useTranslation();
  const t = useCallback((key: string, params?: Record<string, unknown>) => String(translate(key, params)), [translate]);
  return (
    <Form
      i18nConfig={{ t, validationTranslation: { required: "validation.required", minLength: "validation.minLength" } }}
      config={{
        username: {
          type: "text",
          label: "username.label",
          description: "username.description",
          rules: { required: true, minLength: 3 },
        },
      }}
    >
      <button type="button" onClick={() => i18n.changeLanguage(i18n.language === "en" ? "vi" : "en")}>
        {i18n.language === "en" ? "Tiếng Việt" : "English"}
      </button>
      <button type="submit">Submit</button>
    </Form>
  );
}
