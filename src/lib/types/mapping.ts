/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldValues } from "react-hook-form"
import type { ComponentMap, FormConfig } from "./config"

export interface NestedFieldProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
> {
  /**
   * Form field configuration including field type, name, label, props, etc.
   */
  config?: FormConfig<TModel, TComponentMap>
}
