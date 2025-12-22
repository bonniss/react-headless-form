/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react"
import { FieldValues, useFormContext } from "react-hook-form"

import type {
  BlueFormProps,
  ComponentMap,
  CoreFieldType,
  FieldResolvedProps,
  FormFieldConfig,
  NestedFieldProps,
} from "@/types"

import { I18nResolvedConfig } from "@/types/form"
import { typedKeys } from "../helper/typed-keys"
import HiddenField from "./field/HiddenField"
import InlineField from "./field/InlineField"
import { FieldArrayProvider } from "./provider/FieldArrayProvider"
import { FieldProvider } from "./provider/FieldProvider"

interface BlueFormEngineProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
> extends Pick<
    BlueFormProps<TModel, TComponentMap>,
    "config" | "readOnly" | "readOnlyEmptyFallback" | "fieldMapping"
  > {
  namespace?: string
  i18nConfig: I18nResolvedConfig
}

function BlueFormEngine<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
>({
  i18nConfig,
  fieldMapping,
  config,
  readOnly: isFormReadOnly,
  readOnlyEmptyFallback,
  namespace,
}: BlueFormEngineProps<TModel, TComponentMap>) {
  const { t, validationResolver } = i18nConfig
  const { watch } = useFormContext()
  const values = watch() as Partial<TModel>

  const body = (
    <>
      {Object.entries(config).map(([key, fieldConfig], index) => {
        let component = null
        const field = fieldConfig as FormFieldConfig<TModel, TComponentMap>
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
          typeof visible === "function" ? visible(values) : visible !== false
        const isDisabled =
          typeof disabled === "function" ? disabled(values) : !!disabled
        const isReadonly = Boolean(isFormReadOnly ?? isFieldReadOnly)
        const isRequired = Boolean(rules?.required)

        if (
          Object.keys(rules).length && Object.keys(validationResolver).length
        ) {
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

        switch (type as CoreFieldType) {
          case "array": {
            const ArrayField = fieldMapping?.["array"]
            if (!ArrayField) {
              throw new Error(
                `No component of array field found for **${resolvedProps.name}**`
              )
            }
            component = (
              <FieldArrayProvider
                defaultValue={{ resolved: resolvedProps, config: field }}
              >
                <ArrayField {...componentProps} />
              </FieldArrayProvider>
            )
            break
          }
          case "group":
          case "ui": {
            const contentConfig = (
              componentProps as NestedFieldProps<TModel, TComponentMap>
            )?.config
            let children = null

            if (contentConfig) {
              children = (
                <BlueFormEngine
                  config={contentConfig}
                  readOnly={isFormReadOnly}
                  readOnlyEmptyFallback={readOnlyEmptyFallback}
                  i18nConfig={i18nConfig}
                  fieldMapping={fieldMapping}
                  namespace={
                    (type as CoreFieldType) === "ui" ? namespace : path
                  }
                />
              )
            }

            component =
              render?.({
                fieldProps: resolvedProps,
                children,
                props: componentProps,
              }) ?? children
            break
          }
          default: {
            let Component = fieldMapping?.[type]
            if (!Component && (type as CoreFieldType) === "hidden") {
              Component = HiddenField
            }
            if (!Component && (type as CoreFieldType) === "inline") {
              Component = InlineField
            }
            if (Component) {
              component = (
                <FieldProvider
                  defaultValue={{ resolved: resolvedProps, config: field }}
                >
                  <Component {...componentProps} />
                </FieldProvider>
              )
            } else {
              throw new Error(
                `No renderer found for field **${path}** with type **${type}**`
              )
            }
            break
          }
        }

        return <Fragment key={path}>{component}</Fragment>
      })}
    </>
  )

  return body
}

export default BlueFormEngine
