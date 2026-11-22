/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType, ReactNode } from "react"
import type { FieldValues } from "react-hook-form"
import type { ComponentMap, FormConfig } from "./config"

export type FormSectionComponent = ComponentType<{
  children?: ReactNode
}>

export interface FormSectionProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> {
  /**
   * Nested form config rendered inside this section
   */
  config?: FormConfig<TModel, TComponentMap>

  /**
   * Whether this section should create a new namespace
   * - true  => behaves like old "group"
   * - false => behaves like old "ui"
   *
   * @default false
   */
  nested?: boolean

  /**
   * Custom component to render this section.
   * It can use `useField()` and `<Section />` internally.
   */
  component?: FormSectionComponent
}

/**
 * Props that `useField()` supplies to a field adapter. An adapter sets them
 * itself, so a config's `props` should not (they would be silently overridden).
 */
export type FieldControlledProps =
  | "value"
  | "defaultValue"
  | "onChange"
  | "onBlur"
  | "name"
  | "ref"
  | "label"
  | "disabled"
  | "readOnly"
  | "required"

/**
 * The props an adapter accepts from a config's `props`: the UI component's own
 * props, minus what `useField()` controls, minus `TExtra` (library-specific
 * props the adapter also sets, e.g. Mantine's `error`).
 *
 * @example
 * type TextFieldProps = AdapterProps<TextInputProps, "error" | "withAsterisk">
 * function TextField(props: TextFieldProps) {
 *   const { value, onChange, label, errorMessage } = useField()
 *   return <TextInput {...props} label={label} value={value ?? ""} error={errorMessage} onChange={...} />
 * }
 */
export type AdapterProps<TProps, TExtra extends PropertyKey = never> = Omit<
  TProps,
  FieldControlledProps | TExtra
>
