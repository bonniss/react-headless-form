/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldValues } from 'react-hook-form'
import { ComponentMap, FormConfig } from './config'

export interface FieldArrayProps<TModel extends FieldValues, TComponentMap extends Record<string, any>> {
  /**
   * Form field configuration including field type, name, label, props, etc.
   */
  config: FormConfig<TModel, TComponentMap>

  /**
   * Initial values for the form.
   */
  defaultValues?: Partial<TModel>
}

export interface NestedFieldProps<TModel extends FieldValues, TComponentMap extends ComponentMap> {
  /**
   * Form field configuration including field type, name, label, props, etc.
   */
  config?: FormConfig<TModel, TComponentMap>
}
