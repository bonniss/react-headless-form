import { setupForm, defineMapping } from "react-headless-form";
import i18next from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import InputField from "./fields/InputField";

// Initialize i18next with inline translations for demo purposes.
// In a real app this would live in your i18n bootstrap file.
i18next.use(initReactI18next).init({
  lng: "en",
  resources: {
    en: {
      translation: {
        "form.username.label": "Username",
        "form.username.description": "Your public display name",
        "form.email.label": "Email",
        "form.password.label": "Password",
        "validation.required": "{{field}} is required",
        "validation.minLength":
          "{{field}} must be at least {{minLength}} characters",
        "validation.pattern": "{{field}} format is invalid",
        "switch.language": "Switch to Vietnamese",
      },
    },
    vi: {
      translation: {
        "form.username.label": "Tên người dùng",
        "form.username.description": "Tên hiển thị công khai của bạn",
        "form.email.label": "Email",
        "form.password.label": "Mật khẩu",
        "validation.required": "{{field}} là bắt buộc",
        "validation.minLength": "{{field}} phải có ít nhất {{minLength}} ký tự",
        "validation.pattern": "{{field}} không đúng định dạng",
        "switch.language": "Chuyển sang tiếng Anh",
      },
    },
  },
  interpolation: { escapeValue: false },
});

const [Form] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <div className="blueform-example">
      <form onSubmit={onSubmit}>{children}</form>
    </div>
  ),
  fieldMapping: defineMapping({ text: InputField }),
  i18nConfig: {
    t: (key, params) => i18next.t(key, params as object),
    validationTranslation: {
      required: "validation.required",
      minLength: "validation.minLength",
      pattern: "validation.pattern",
    },
  },
});

export default function EgI18nI18next() {
  const { i18n, t } = useTranslation();

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language === "en" ? "vi" : "en");

  return (
    <div>
      <div style={{ textAlign: "right", marginBottom: "0.5rem" }}>
        <button type="button" onClick={toggleLang}>
          {t("switch.language")}
        </button>
      </div>

      <Form
        key={i18n.language}
        config={{
          username: {
            type: "text",
            label: "form.username.label",
            description: "form.username.description",
            rules: { required: true, minLength: 3 },
          },
          email: {
            type: "text",
            label: "form.email.label",
            props: { type: "email" },
            rules: {
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            },
          },
          password: {
            type: "text",
            label: "form.password.label",
            props: { type: "password" },
            rules: { required: true, minLength: 6 },
          },
        }}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      >
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
}
