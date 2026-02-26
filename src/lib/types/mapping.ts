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
