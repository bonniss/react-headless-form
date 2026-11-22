import { useMemo, useState } from "react";
import { IntlProvider, useIntl } from "react-intl";
import en from "./i18n/en.json";
import { I18nForm } from "./i18n/form";
import vi from "./i18n/vi.json";

const messages = { en, vi };
type Locale = keyof typeof messages;

// `intl` from useIntl() changes with the locale; the messages are ICU ({field})
function useI18nConfig() {
  const intl = useIntl();
  return useMemo(
    () => ({
      t: (key: string, params?: Record<string, unknown>) =>
        intl.formatMessage({ id: key }, params as Record<string, string>),
    }),
    [intl],
  );
}

function UsernameForm({ onToggle }: { onToggle: () => void }) {
  const intl = useIntl();
  return (
    <I18nForm
      i18nConfig={useI18nConfig()}
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
