/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react"
import { type FieldValues, useFormContext } from "react-hook-form"

import type {
  BlueFormProps,
  ComponentMap,
  CoreFieldType,
  FieldResolvedProps,
  FormFieldConfig,
  FormSectionProps,
} from "@/types"

import { typedKeys } from "../../helper/typed-keys"
import { ArrayRenderSlot } from "../field"
import HiddenField from "../field/HiddenField"
import InlineField from "../field/InlineField"
import { FieldArrayProvider } from "../provider"
import { FieldProvider } from "../provider/FieldProvider"
import { useBlueFormInternal } from "./BlueFormInternalProvider"

interface BlueFormEngineProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> extends Pick<BlueFormProps<TModel, TComponentMap>, "config"> {
  namespace?: string
}

function BlueFormEngine<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
>({ config, namespace }: BlueFormEngineProps<TModel, TComponentMap>) {
  const {
    i18nConfig: { t, validationResolver },
    fieldMapping,
    readOnly: isFormReadOnly,
    readOnlyEmptyFallback,
  } = useBlueFormInternal()
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
          Object.keys(rules).length &&
          Object.keys(validationResolver).length
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
          namespace,
          path,
          name: key,
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
            if (!ArrayField && !render) {
              throw new Error(
                `[react-headless-form] Array field "${resolvedProps.name}" requires either a fieldMapping["array"] component or a render() function in its config.`,
              )
            }

            component = (
              <FieldArrayProvider
                defaultValue={{ resolved: resolvedProps, config: field }}
              >
                {ArrayField ? (
                  <ArrayField {...componentProps} />
                ) : (
                  <ArrayRenderSlot render={render} />
                )}
              </FieldArrayProvider>
            )

            break
          }

          case "section": {
            const sectionProps = componentProps as FormSectionProps<
              TModel,
              TComponentMap
            >
            let children = null

            const nested = sectionProps?.nested ?? false
            const effectiveNamespace = nested ? path : namespace
            const sectionResolvedProps = {
              ...resolvedProps,
              namespace: effectiveNamespace,
            } as FieldResolvedProps

            const contentConfig = sectionProps?.config
            const SectionComponent = sectionProps?.component

            if (SectionComponent) {
              if (contentConfig) {
                console.warn(
                  `[react-headless-form] Section "${path}" has both "component" and "config". ` +
                    `"component" will be used and "config" will be ignored.`,
                )
              }
              children = <SectionComponent />
            } else if (contentConfig) {
              children = (
                <BlueFormEngine
                  config={contentConfig}
                  namespace={effectiveNamespace}
                />
              )
            }

            const node =
              render?.({
                fieldProps: sectionResolvedProps,
                children,
                props: componentProps,
              }) ?? children

            // allow deeply access to fieldProps for form section
            component = (
              <FieldProvider
                defaultValue={{ resolved: sectionResolvedProps, config: field }}
              >
                {node}
              </FieldProvider>
            )

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
                `[react-headless-form] No renderer found for field **${path}** with type **${type}**`,
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
