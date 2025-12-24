/* eslint-disable @typescript-eslint/no-explicit-any */

import type { BaseSyntheticEvent, PropsWithChildren, ReactNode } from "react"
import type {
  FieldErrors,
  FieldValues,
  Path,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form"
import type {
  TranslateFn,
  TranslationResolver,
  ValidationResolver,
  ValidationTranslationMap,
} from "@/components/i18n"
import type { ComponentMap, FormConfig } from "./config"
import type { BlueFormPlugin } from "./plugin"

export type SubmitHandlerWithFormMethods<
  TModel extends FieldValues = FieldValues
> = (
  data: TModel,
  formMethods: UseFormReturn<TModel>,
  event?: React.BaseSyntheticEvent
) => ReturnType<SubmitHandler<TModel>>

type RootRendererArgs<TModel = FieldValues> = {
  formMethods: UseFormReturn
  children: ReactNode
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>
  onError?: (errors: FieldErrors) => void
  submit: (raw: TModel) => void
}

/**
 * Custom root wrapper renderer. Useful for replacing the default <form> with any custom structure.
 */
export type RootRenderer<TModel extends FieldValues = FieldValues> = (
  args: RootRendererArgs<TModel>
) => ReactNode

export type BlueFormRef<TModel = FieldValues> = UseFormReturn<
  any,
  any,
  TModel
> | null

export type I18nConfig = {
  /**
   * Whether to enable i18n support for validation messages.
   * If false or omitted, messages will fallback to raw/default text.
   */
  enabled?: boolean

  /**
   * Translation function used to resolve localized message strings.
   * If not provided, defaults to an identity function: (key) => key
   */
  t?: TranslateFn

  /**
   * Custom resolver for formatting validation messages.
   * Allows overriding or extending default error message generation logic.
   */
  validationTranslation?: ValidationTranslationMap
}

export type I18nResolvedConfig = {
  /**
   * Translation function used to resolve localized message strings.
   * If not provided, defaults to an identity function: (key) => key
   */
  t: TranslationResolver

  /**
   * Custom resolver for formatting validation messages.
   * Allows overriding or extending default error message generation logic.
   */
  validationResolver: ValidationResolver
}

export interface BlueFormBaseConfig<
  TComponentMap extends ComponentMap = ComponentMap
> {
  /**
   * Internationalization (i18n) and validation message configuration.
   */
  i18nConfig?: I18nConfig

  /**
   * Mapping between field types and React components used to render them.
   * Example: `{ text: TextField, select: SelectField }`
   */
  fieldMapping?: TComponentMap

  /**
   * Custom root renderer for the form element.
   * Defaults to rendering a native `<form>` element.
   */
  renderRoot?: RootRenderer

  /**
   * Fallback content to display when a field has no value and the form is in read-only mode.
   * Triggered for values that are `null`, `undefined`, or empty strings.
   *
   * Instead of rendering an empty input or textarea, this fallback will be shown
   * (e.g. `"No data available"`).
   */
  readOnlyEmptyFallback?: ReactNode

  /**
   * Plugins to extend or modify form behavior.
   */
  plugins?: BlueFormPlugin[]
}

export interface BlueFormProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
> extends BlueFormBaseConfig<TComponentMap>,
    PropsWithChildren {
  /**
   * Form field configuration including field type, name, label, props, etc.
   */
  config: FormConfig<TModel, TComponentMap>

  /**
   * Called when the form is submitted successfully and passes validation.
   */
  onSubmit?: SubmitHandlerWithFormMethods<TModel>

  /**
   * Called after a successful form submission.
   */
  onSubmitSuccess?: SubmitHandlerWithFormMethods<TModel>

  /**
   * Called when form submission fails due to validation errors.
   */
  onSubmitError?: SubmitErrorHandler<TModel>

  /**
   * Initial values for the form.
   */
  defaultValues?: Partial<TModel>

  /**
   * Props to pass to RHF's `useForm` hook.
   * @see https://react-hook-form.com/docs/useform
   */
  formProps?: UseFormProps<TModel>

  /**
   * When true, the form renders in read-only mode with static text instead of inputs.
   */
  readOnly?: boolean

  /**
   * Callback invoked once on mount, useful for side effects like setting dynamic default values.
   */
  onInit?: (form: UseFormReturn<TModel>) => void

  /**
   * Called when a single field value changes.
   */
  onFieldChange?: (
    name: string,
    value: any,
    form: UseFormReturn<TModel>
  ) => void

  /**
   * Called whenever the entire form state changes.
   */
  onFormChange?: (values: TModel, form: UseFormReturn<TModel>) => void

  /**
   * Delay in milliseconds before reacting to form value changes.
   * Useful for debouncing side effects such as conditional logic,
   * dynamic field updates, or remote data fetching based on form state.
   *
   * Example: changeDebounceDelay = 300 → triggers logic only after 300ms
   * of no further changes.
   *
   * Set to 0 or leave undefined to disable debounce.
   */
  changeDebounceDelay?: number
}
