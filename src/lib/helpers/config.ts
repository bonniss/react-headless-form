import { FieldValues } from 'react-hook-form'
import { ComponentMap, FormConfig } from '../types'

/**
 * A factory function that returns a utility function to create a
 * form configuration object. The returned utility function takes
 * a form configuration object and returns the same object, which
 * can then be used to configure a dynamic form engine.
 *
 * The purpose of this factory function is to allow the form
 * configuration object to be type-checked against a generic type
 * parameter, which represents the component map used by the form
 * engine.
 *
 */
export function createFormConfigFactory<TComponentMap extends ComponentMap>() {
  return function configForm<TModel extends FieldValues>(
    config: FormConfig<TModel, TComponentMap>
  ): FormConfig<TModel, TComponentMap> {
    return config
  }
}
