/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveRules } from "@/components/helper/resolve-rules";
import type { TranslatableText, TranslationResolver } from "@/components/i18n";
import type { FieldResolvedProps, FormFieldConfig } from "@/types";
import type { I18nResolvedConfig } from "@/types/form";

function isTranslatable(value: unknown): value is TranslatableText {
  return (
    typeof value === "string" ||
    (typeof value === "object" &&
      value !== null &&
      ("message" in value || "text" in value))
  );
}

/**
 * Translates the props listed in `i18nConfig.translateProps`.
 * Returns the original object when nothing needs translating.
 */
function translateComponentProps<T>(
  props: T,
  translateProps: string[],
  t: TranslationResolver,
): T {
  if (!props || !translateProps.length) return props;
  let result: Record<string, unknown> | undefined;
  for (const name of translateProps) {
    const value = (props as Record<string, unknown>)[name];
    if (!isTranslatable(value)) continue;
    result ??= { ...(props as Record<string, unknown>) };
    result[name] = t(value);
  }
  return (result ?? props) as T;
}

/** The parts of `FieldResolvedProps` that do not depend on form values. */
export type CompiledField = {
  path: string;
  type: string;
  componentProps: any;
  base: Omit<FieldResolvedProps, "visible" | "disabled" | "required">;
};

/**
 * Compile phase: everything about a field that depends only on its config and
 * the i18n setup (path, translations, resolved rules). Runs once per config /
 * translator change instead of on every render; conditions that depend on form
 * values are evaluated separately (see `useFieldConditions`).
 */
export function compileField({
  name,
  field,
  namespace,
  i18n: { t, validationResolver, translateProps },
  formReadOnly,
}: {
  name: string;
  field: FormFieldConfig<any, any>;
  namespace?: string;
  i18n: I18nResolvedConfig;
  formReadOnly?: boolean;
}): CompiledField {
  const path = namespace ? `${namespace}.${name}` : name;
  const type = field.type as string;
  const label = t(field.label);

  return {
    path,
    type,
    componentProps: translateComponentProps(field.props, translateProps, t),
    base: {
      id: path,
      namespace,
      path,
      name,
      type,
      label,
      description: t(field.description),
      // the form can only add read-only: `<Form readOnly={false}>` keeps a field's own
      readOnly: Boolean(formReadOnly || field.readOnly),
      rules: resolveRules(field.rules ?? {}, validationResolver, label),
      defaultValue: field.defaultValue,
    } as CompiledField["base"],
  };
}
