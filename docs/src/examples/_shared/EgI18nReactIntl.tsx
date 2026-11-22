import { useMemo, useState } from "react";
import { IntlProvider, useIntl } from "react-intl";
import en from "./i18n/en.json";
import { I18nForm } from "./i18n/form";
import vi from "./i18n/vi.json";

const messages = { en, vi };
type Locale = keyof typeof messages;

function UsernameForm({ onToggle }: { onToggle: () => void }) {
  // `intl` changes with the locale: a new `t` for each one (ICU messages: {field})
  const intl = useIntl();
  const t = useMemo(
    () => (key: string, params?: Record<string, unknown>) =>
      intl.formatMessage({ id: key }, params as Record<string, string>),
    [intl],
  );
  return (
    <I18nForm
      i18nConfig={{ t }}
      config={{
        username: {
          type: "text",
          label: "username_label",
          description: "username_description",
          props: { placeholder: "placeholder_react_intl" },
          rules: { required: true, minLength: 3 },
        },
      }}
    >
      <button type="button" onClick={onToggle}>
        {intl.locale === "en" ? "Tiếng Việt" : "English"}
      </button>
      <button type="submit">Submit</button>
    </I18nForm>
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
