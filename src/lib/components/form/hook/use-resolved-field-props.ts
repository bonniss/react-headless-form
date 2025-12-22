import type { FieldValues } from "react-hook-form"
import { typedKeys } from "@/components/helper/typed-keys"
import type { ComponentMap, FieldResolvedProps, FormFieldConfig } from "@/types"
import type { I18nResolvedConfig } from "@/types/form"

type UseResolvedFieldPropsOption<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
> = {
  fieldKey: string
  fieldConfig: FormFieldConfig<TModel, TComponentMap>
  formValues: Partial<TModel>
  isFormReadOnly?: boolean
  i18nConfig: I18nResolvedConfig
  readOnlyEmptyFallback?: any
  namespace?: string
}

export const useResolvedFieldProps = <
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
>(
  options: UseResolvedFieldPropsOption<TModel, TComponentMap>
) => {
  const {
    fieldKey: key,
    fieldConfig: field,
    namespace,
    formValues,
    i18nConfig,
    readOnlyEmptyFallback,
    isFormReadOnly,
  } = options

  const { t, validationResolver } = i18nConfig

  const type = field.type as string
  const {
    props: componentProps,
    render,
    visible = true,
    disabled = false,
    defaultValue,
    label,
    rules = {},
    description,
    readOnly: isFieldReadOnly,
  } = field

  const path = (namespace ? `${namespace}.${key}` : key) as string

  const translatedLabel = t(label)
  const translatedDescription = t(description)

  const isVisible =
    typeof visible === "function" ? visible(formValues) : visible !== false
  const isDisabled =
    typeof disabled === "function" ? disabled(formValues) : !!disabled
  const isReadonly = Boolean(isFormReadOnly ?? isFieldReadOnly)
  const isRequired = Boolean(rules?.required)

  if (Object.keys(rules).length && Object.keys(validationResolver).length) {
    for (const ruleType of typedKeys(rules)) {
      const rule = rules[ruleType]
      const resolver = validationResolver[ruleType]
      if (rule && resolver) {
        const resolvedRule = resolver({
          field: translatedLabel!,
          rule: rule as any,
        })
        if (resolvedRule) {
          rules[ruleType] = resolvedRule as any
        }
      }
    }
  }

  const resolvedProps = {
    id: path,
    path,
    name: key,
    namespace,
    type,
    label: translatedLabel,
    description: translatedDescription,
    disabled: isDisabled,
    readOnly: isReadonly,
    visible: isVisible,
    required: isRequired,
    readOnlyEmptyFallback,
    rules,
    defaultValue,
  } as FieldResolvedProps

  return resolvedProps
}
