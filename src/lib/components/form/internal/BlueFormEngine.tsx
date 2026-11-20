/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useMemo } from "react"
import { type FieldValues, useFormContext, useWatch } from "react-hook-form"

import type {
  BlueFormProps,
  ComponentMap,
  CoreFieldType,
  FieldResolvedProps,
  FieldSlotContent,
  FormFieldConfig,
  FormSectionProps,
} from "@/types"

import { resolveRules } from "@/components/helper/resolve-rules"
import type { TranslatableText, TranslationResolver } from "@/components/i18n"
import type { RenderFn } from "@/types/render"
import { ArrayRenderSlot } from "../field"
import HiddenField from "../field/HiddenField"
import InlineField from "../field/InlineField"
import { FieldArrayProvider } from "../provider"
import { FieldProvider, useField } from "../provider/FieldProvider"
import { useBlueFormInternal } from "./BlueFormInternalProvider"

interface BlueFormEngineProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> extends Pick<BlueFormProps<TModel, TComponentMap>, "config"> {
  namespace?: string
}

/**
 * Checks whether a config object (at this engine level only) contains any field
 * that uses `visible`, `disabled` or `required` as a function.
 *
 * Used to decide whether this BlueFormEngine instance needs to subscribe to form
 * values via watch(). If no field uses conditional logic, the subscription is
 * skipped — avoiding full-form re-renders on every keystroke for this engine level.
 *
 * Scans only the direct fields of the given config. Nested section configs are
 * handled by their own child BlueFormEngine instance, which runs its own scan.
 */
function isConditionalField(field: any): boolean {
  return (
    typeof field?.visible === "function" ||
    typeof field?.disabled === "function" ||
    typeof field?.required === "function"
  )
}

type ValuesSubscription =
  | { mode: "none" }
  | { mode: "all" }
  | { mode: "deps"; deps: string[] }

/**
 * Decides how this engine level subscribes to form values:
 * - `none`: no conditional fields → no subscription
 * - `deps`: every conditional field declares `deps` → watch only those paths
 * - `all`:  otherwise → watch the whole form (previous behavior)
 */
function getValuesSubscription(
  config: Record<string, any>,
): ValuesSubscription {
  const conditional = Object.values(config).filter(isConditionalField)
  if (!conditional.length) return { mode: "none" }
  if (!conditional.every((field) => Array.isArray(field.deps))) {
    return { mode: "all" }
  }
  const deps = [...new Set(conditional.flatMap((field) => field.deps))]
  return { mode: "deps", deps }
}

/**
 * Renders a `slots.before` / `slots.after` entry. Function slots receive the
 * live field context from the enclosing `FieldProvider`.
 */
function FieldSlot({ slot }: { slot: FieldSlotContent }) {
  const field = useField()
  return <>{typeof slot === "function" ? slot(field) : slot}</>
}

function renderStaticSlot(
  slot: FieldSlotContent | undefined,
  ctx: FieldResolvedProps,
) {
  if (slot === undefined) return null
  return typeof slot === "function" ? slot(ctx) : slot
}

function isTranslatable(value: unknown): value is TranslatableText {
  return (
    typeof value === "string" ||
    (typeof value === "object" &&
      value !== null &&
      ("message" in value || "text" in value))
  )
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
  if (!props || !translateProps.length) return props
  let result: Record<string, unknown> | undefined
  for (const name of translateProps) {
    const value = (props as Record<string, unknown>)[name]
    if (!isTranslatable(value)) continue
    result ??= { ...(props as Record<string, unknown>) }
    result[name] = t(value)
  }
  return (result ?? props) as T
}

function BlueFormEngine<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
>({ config, namespace }: BlueFormEngineProps<TModel, TComponentMap>) {
  const {
    i18nConfig: { t, validationResolver, translateProps },
    fieldMapping,
    readOnly: isFormReadOnly,
  } = useBlueFormInternal()
  const { watch, getValues, control } = useFormContext()

  // Determine how this config level needs form values for conditional logic.
  // Memoized because config is typically a stable object reference (defined
  // outside the component tree), and the scan itself is cheap O(n).
  const subscription = useMemo(() => getValuesSubscription(config), [config])

  // `deps` mode: re-render only when the declared paths change.
  // useWatch is always called (rules of hooks) and disabled otherwise.
  useWatch({
    control,
    name: subscription.mode === "deps" ? subscription.deps : [],
    disabled: subscription.mode !== "deps" || !subscription.deps.length,
  })

  // - none: watch() is never called → no re-render on value changes
  // - deps: read a snapshot with getValues() (no global subscription)
  // - all:  watch() subscribes to every change (fields without `deps`)
  const values = (
    subscription.mode === "none"
      ? {}
      : subscription.mode === "deps"
        ? getValues()
        : watch()
  ) as Partial<TModel>

  const body = (
    <>
      {Object.entries(config).map(([key, fieldConfig], index) => {
        let component = null
        const field = fieldConfig as FormFieldConfig<TModel, TComponentMap>
        const type = field.type as string
        const {
          props: rawComponentProps,
          render,
          visible = true,
          disabled = false,
          defaultValue,
          label,
          rules = {},
          description,
          readOnly: isFieldReadOnly,
          required,
          slots,
        } = field

        const path = (namespace ? `${namespace}.${key}` : key) as string

        const componentProps = translateComponentProps(
          rawComponentProps,
          translateProps,
          t,
        )

        const translatedLabel = t(label)
        const translatedDescription = t(description)

        const isVisible =
          typeof visible === "function" ? visible(values) : visible !== false

        if (!isVisible) {
          return <Fragment key={path} />
        }

        const isDisabled =
          typeof disabled === "function" ? disabled(values) : !!disabled
        const isReadonly = Boolean(isFormReadOnly ?? isFieldReadOnly)
        // `required` only drives the UI flag (e.g. "*"); validation stays in `rules`.
        const isRequired =
          required === undefined
            ? Boolean(rules?.required)
            : typeof required === "function"
              ? required(values)
              : required
        const resolvedRules = resolveRules(
          rules,
          validationResolver,
          translatedLabel,
        )

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
          rules: resolvedRules,
          defaultValue,
        } as FieldResolvedProps

        switch (type as CoreFieldType) {
          case "array": {
            const ArrayField = fieldMapping?.["array"]
            if (!ArrayField && !render) {
              throw new Error(
                `[react-headless-form] Array field "${path}" requires either \`fieldMapping["array"]\` or \`render\`.`,
              )
            }

            component = (
              <FieldArrayProvider
                defaultValue={{ resolved: resolvedProps, config: field }}
              >
                {renderStaticSlot(slots?.before, resolvedProps)}
                {ArrayField ? (
                  <ArrayField {...componentProps} />
                ) : (
                  <ArrayRenderSlot render={render as RenderFn<"array">} />
                )}
                {renderStaticSlot(slots?.after, resolvedProps)}
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
                  `[react-headless-form] Section "${path}" has both \`component\` and \`config\`. \`component\` will be used and \`config\` will be ignored.`,
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
              (render as RenderFn<"section">)?.({
                ...sectionResolvedProps,
                children,
              }) ?? children

            // allow deeply access to fieldProps for form section
            component = (
              <FieldProvider
                defaultValue={{ resolved: sectionResolvedProps, config: field }}
              >
                {slots?.before !== undefined && <FieldSlot slot={slots.before} />}
                {node}
                {slots?.after !== undefined && <FieldSlot slot={slots.after} />}
              </FieldProvider>
            )

            break
          }

          default: {
            let node: any
            if ((type as CoreFieldType) === "hidden") {
              node = <HiddenField {...componentProps} />
            } else if ((type as CoreFieldType) === "inline") {
              node = <InlineField {...componentProps} />
            } else {
              const Component = fieldMapping?.[type]

              if (!Component) {
                throw new Error(
                  `[react-headless-form] No renderer found for field "${path}" with type "${type}". Check your \`fieldMapping\` or field \`type\`.`,
                )
              }

              const element = <Component {...componentProps} />
              node = render
                ? (render as RenderFn<string>)({
                    ...resolvedProps,
                    self: element,
                  })
                : element
            }

            component = (
              <FieldProvider
                defaultValue={{ resolved: resolvedProps, config: field }}
              >
                {slots?.before !== undefined && <FieldSlot slot={slots.before} />}
                {node}
                {slots?.after !== undefined && <FieldSlot slot={slots.after} />}
              </FieldProvider>
            )
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
