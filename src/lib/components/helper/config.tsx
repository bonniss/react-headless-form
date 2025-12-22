import type { BlueFormProps, ComponentMap, FormConfig } from "@/types"
import type { FieldValues } from "react-hook-form"
import BlueForm from "../form/BlueForm"

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

export type CreateBlueFormOptions<TComponentMap extends ComponentMap> = {
  fieldMapping: TComponentMap
}

export const setupForm = <TComponentMap extends ComponentMap>({
  fieldMapping,
}: CreateBlueFormOptions<TComponentMap>) => {
  const defineConfig = createDefineConfigFn<TComponentMap>()
  const Form = <TModel extends FieldValues>(
    props: Omit<BlueFormProps<TModel, TComponentMap>, "fieldMapping">
  ) => {
    return (
      // @ts-expect-error HACK: to fix generic type issue
      <BlueForm
        {...props}
        fieldMapping={fieldMapping}
      />
    )
  }

  return [Form, defineConfig] as const
}
