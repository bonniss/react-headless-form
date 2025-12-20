/* eslint-disable @typescript-eslint/no-explicit-any */
import { DevTool } from '@hookform/devtools'
import { BaseSyntheticEvent, ComponentProps, CSSProperties, ReactNode } from 'react'
import {
  FieldErrors,
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form'
import { ComponentMap, FormConfig } from './config'

interface CommonProps {
  id?: string
  className?: string
  children?: ReactNode
  style?: CSSProperties
}

export type SubmitHandlerWithFormMethods<TModel extends FieldValues = FieldValues> = (
  data: TModel,
  formMethods: UseFormReturn<TModel>,
  event?: React.BaseSyntheticEvent
) => ReturnType<SubmitHandler<TModel>>

type RootRendererArgs<TModel = FieldValues> = {
  formMethods: UseFormReturn
  children: ReactNode
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>
  submit: (raw: TModel) => void
  errorHandler: (errors: FieldErrors) => void
} & Omit<CommonProps, 'children'>

/**
 * Custom root wrapper renderer. Useful for replacing the default <form> with any custom structure.
 */
export type RootRenderer<TModel = FieldValues> = (args: RootRendererArgs<TModel>) => ReactNode

export type DynamicFormRef<TModel = FieldValues> = UseFormReturn<any, any, TModel> |  null

export interface DynamicFormCommonProps {
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
   * (e.g. `"No data available"` or `"Chưa có dữ liệu"`).
   */
  readOnlyEmptyFallback?: ReactNode

  /**
   * Enable the React Hook Form DevTool for debugging form state.
   */
  devToolConfig?: DevToolConfig
}

export interface DynamicFormProps<TModel extends FieldValues, TComponentMap extends ComponentMap>
  extends CommonProps,
    DynamicFormCommonProps {
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
  onFieldChange?: (name: keyof TModel, value: any, form: UseFormReturn<TModel>) => void

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

export type DevToolConfig = {
  enabled?: boolean
  devToolProps?: Omit<NonNullable<ComponentProps<typeof DevTool>>, 'control'>
}
