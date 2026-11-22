import { useCallback, useState } from "react";
import { IntlProvider, useIntl } from "react-intl";
import { Form } from "./form.setup";

// ICU messages: `{field}` / `{minLength}` are the params BlueForm passes
const messages = {
  en: {
    "username.label": "Username",
    "username.description": "Your public display name",
    "username.placeholder": "e.g. ada_lovelace",
    "validation.required": "{field} is required",
    "validation.minLength": "{field} must be at least {minLength} characters",
  },
  vi: {
    "username.label": "Tên người dùng",
    "username.description": "Tên hiển thị công khai của bạn",
    "username.placeholder": "ví dụ: ada_lovelace",
    "validation.required": "{field} là bắt buộc",
    "validation.minLength": "{field} phải có ít nhất {minLength} ký tự",
  },
};
type Locale = keyof typeof messages;

function UsernameForm({ onToggle }: { onToggle: () => void }) {
  const intl = useIntl();
  // a new `t` when the locale changes: labels and shown errors follow it
  const t = useCallback(
    (key: string, params?: Record<string, unknown>) => intl.formatMessage({ id: key }, params as Record<string, string>),
    [intl],
  );
  return (
    <Form
      i18nConfig={{
        t,
        validationTranslation: { required: "validation.required", minLength: "validation.minLength" },
        translateProps: ["placeholder"],
      }}
      config={{
        username: {
          type: "text",
          label: "username.label",
          description: "username.description",
          props: { placeholder: "username.placeholder" },
          rules: { required: true, minLength: 3 },
        },
      }}
    >
      <button type="button" onClick={onToggle}>
        {intl.locale === "en" ? "Tiếng Việt" : "English"}
      </button>
      <button type="submit">Submit</button>
    </Form>
  );
}

export default function EgI18nReactIntl() {
  const [locale, setLocale] = useState<Locale>("en");
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <UsernameForm onToggle={() => setLocale(locale === "en" ? "vi" : "en")} />
    </IntlProvider>
  );
}
