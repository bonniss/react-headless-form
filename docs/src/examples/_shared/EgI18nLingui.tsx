import { setupI18n } from "@lingui/core";
import { compileMessage } from "@lingui/message-utils/compileMessage";
import { I18nProvider, useLingui } from "@lingui/react";
import { useMemo } from "react";
import en from "./i18n/en.json";
import { I18nForm } from "./i18n/form";
import vi from "./i18n/vi.json";

// In an app the Lingui CLI compiles the catalogs at build time;
// this demo compiles the plain ICU messages at runtime instead.
const i18n = setupI18n();
i18n.setMessagesCompiler(compileMessage);
i18n.load({ en, vi });
i18n.activate("en");

// `_` from useLingui() changes on i18n.activate()
function useI18nConfig() {
  const { _ } = useLingui();
  return useMemo(() => ({ t: (key: string, params?: Record<string, unknown>) => _(key, params) }), [_]);
}

function UsernameForm() {
  const { i18n } = useLingui();
  return (
    <I18nForm
      i18nConfig={useI18nConfig()}
      config={{
        username: {
          type: "text",
          label: "username_label",
          description: "username_description",
          props: { placeholder: "placeholder_lingui" },
          rules: { required: true, minLength: 3 },
        },
      }}
    >
      <button type="button" onClick={() => i18n.activate(i18n.locale === "en" ? "vi" : "en")}>
        {i18n.locale === "en" ? "Tiếng Việt" : "English"}
      </button>
      <button type="submit">Submit</button>
    </I18nForm>
  );
}

export default function EgI18nLingui() {
  return (
    <I18nProvider i18n={i18n}>
      <UsernameForm />
    </I18nProvider>
  );
}
