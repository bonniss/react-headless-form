import type {
  BlueFormConfigBase,
  BlueFormProps,
  ComponentMap,
  FormConfig,
} from "@/types"
import { Without } from "@/types/utils"
import type { FieldValues } from "react-hook-form"
import BlueForm from "./BlueForm"

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
export function createDefineConfigFn<TComponentMap extends ComponentMap>() {
  return function configForm<TModel extends FieldValues>(
    config: FormConfig<TModel, TComponentMap>
  ): FormConfig<TModel, TComponentMap> {
    return config
  }
}

export const setupForm = <TComponentMap extends ComponentMap>(
  baseConfig: BlueFormConfigBase<TComponentMap>
) => {
  const defineConfig = createDefineConfigFn<TComponentMap>()
  const Form = <TModel extends FieldValues>(
    props: Without<
      BlueFormProps<TModel, TComponentMap>,
      BlueFormConfigBase<TComponentMap>
    >
  ) => {
    return (
      // @ts-expect-error HACK: to fix generic type issue
      <BlueForm {...baseConfig} {...props} />
    )
  }

  return [Form, defineConfig] as const
}
