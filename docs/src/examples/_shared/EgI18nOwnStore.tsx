import { useMemo, useSyncExternalStore } from "react";
import en from "./i18n/en.json";
import { I18nForm } from "./i18n/form";
import vi from "./i18n/vi.json";

type Lang = "en" | "vi";
type Params = Record<string, unknown>;

// 1. Where the language lives: get/set are yours (localStorage here; a cookie
//    or the URL works the same). setLang notifies the subscribed components.
const listeners = new Set<() => void>();
const getLang = (): Lang => (localStorage.getItem("demo-lang") === "vi" ? "vi" : "en");
const setLang = (lang: Lang) => {
  localStorage.setItem("demo-lang", lang);
  listeners.forEach((notify) => notify());
};
const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => listeners.delete(notify);
};
// re-renders on setLang(); "en" while rendering on the server
const useLang = () => useSyncExternalStore(subscribe, getLang, () => "en" as const);

// 2. A plain function: also usable outside React (services, API errors, toasts)
//    as translate(getLang(), key, params)
const messages: Record<Lang, Record<string, string>> = { en, vi };
const translate = (lang: Lang, key: string, params?: Params) =>
  (messages[lang][key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(params?.[name] ?? ""));

// 3. One hook for every form: a new `t` per language, the same one in between
function useI18nConfig() {
  const lang = useLang();
  return useMemo(() => ({ t: (key: string, params?: Params) => translate(lang, key, params) }), [lang]);
}

export default function EgI18nOwnStore() {
  const lang = useLang();
  return (
    <I18nForm
      i18nConfig={useI18nConfig()}
      config={{
        username: {
          type: "text",
          label: "username_label",
          description: "username_description",
          props: { placeholder: "placeholder_own" },
          rules: { required: true, minLength: 3 },
        },
      }}
    >
      <button type="button" onClick={() => setLang(lang === "en" ? "vi" : "en")}>
        {lang === "en" ? "Tiếng Việt" : "English"}
      </button>
      <button type="submit">Submit</button>
    </I18nForm>
  );
}
