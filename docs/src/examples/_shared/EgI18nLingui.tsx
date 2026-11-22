import { setupI18n } from "@lingui/core";
import { compileMessage } from "@lingui/message-utils/compileMessage";
import { I18nProvider, useLingui } from "@lingui/react";
import { useCallback } from "react";
import { Form } from "./form.setup";

// In an app the Lingui CLI compiles the catalogs at build time;
// this demo compiles its plain ICU messages at runtime instead.
const i18n = setupI18n();
i18n.setMessagesCompiler(compileMessage);
i18n.load({
  en: {
    "username.label": "Username",
    "username.description": "Your public display name",
    "validation.required": "{field} is required",
    "validation.minLength": "{field} must be at least {minLength} characters",
  },
  vi: {
    "username.label": "Tên người dùng",
    "username.description": "Tên hiển thị công khai của bạn",
    "validation.required": "{field} là bắt buộc",
    "validation.minLength": "{field} phải có ít nhất {minLength} ký tự",
  },
});
i18n.activate("en");

function UsernameForm() {
  // re-renders on i18n.activate(); `_` translates in the active locale
  const { i18n, _ } = useLingui();
  const t = useCallback((key: string, params?: Record<string, unknown>) => _(key, params), [_]);
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
      <button type="button" onClick={() => i18n.activate(i18n.locale === "en" ? "vi" : "en")}>
        {i18n.locale === "en" ? "Tiếng Việt" : "English"}
      </button>
      <button type="submit">Submit</button>
    </Form>
  );
}

export default function EgI18nLingui() {
  return (
    <I18nProvider i18n={i18n}>
      <UsernameForm />
    </I18nProvider>
  );
}
