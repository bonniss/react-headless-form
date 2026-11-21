// G5: typed i18n keys via module augmentation (separate program: augmentation is global).
import { setupForm, type TranslatableText, type I18nKey } from "react-headless-form";
declare module "react-headless-form" {
  interface Register { i18nKey: "form.name" | "form.age" }
}
type Eq<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const ok: Eq<I18nKey, "form.name" | "form.age"> = true;
const a: TranslatableText = "form.name";
const b: TranslatableText = { message: "form.age", params: { n: 1 } };
const c: TranslatableText = { text: "free text bypasses keys" };
// @ts-expect-error unknown key
const d: TranslatableText = "form.nope";
// @ts-expect-error unknown key in message form
const e: TranslatableText = { message: "x" };
const [, defineConfig] = setupForm();
defineConfig<{ name: string }>({
  // @ts-expect-error label must be a registered key
  name: { type: "hidden", label: "typo" },
});
defineConfig<{ name: string }>({ name: { type: "hidden", label: "form.name" } });
export { ok, a, b, c, d, e };
