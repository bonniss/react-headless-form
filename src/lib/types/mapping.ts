/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldValues } from "react-hook-form"
import type { ComponentMap, FormConfig } from "./config"

export interface NestedFieldProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> {
  /**
   * Form field configuration including field type, name, label, props, etc.
   */
  config?: FormConfig<TModel, TComponentMap>
}

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
   * @default true
   */
  nested?: boolean
}
