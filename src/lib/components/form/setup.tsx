import type {
  BlueFormBaseConfig,
  BlueFormProps,
  ComponentMap,
  FormConfig,
  NestedFieldProps,
} from "@/types"
import type { BlueFormRef } from "@/types/form"
import type { ComponentType, JSX } from "react"
import { forwardRef } from "react"
import type { FieldValues } from "react-hook-form"
import BlueForm from "./BlueForm"

export const PlaceholderForNestedField = null as unknown as ComponentType<
  NestedFieldProps<any, any>
>
export const PlaceholderForHidden = null as unknown as ComponentType<any>
export const PlaceholderForInline = null as unknown as ComponentType<any>

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
 */
export function createDefineConfigFn<TComponentMap extends ComponentMap>() {
  return function configForm<TModel extends FieldValues>(
    config: FormConfig<TModel, TComponentMap>
  ): FormConfig<TModel, TComponentMap> {
    return config
  }
}

export const BASE_MAPPING = {
  hidden: PlaceholderForHidden,
  inline: PlaceholderForInline,
  array: PlaceholderForNestedField,
  group: PlaceholderForNestedField,
  ui: PlaceholderForNestedField,
} as const satisfies ComponentMap

export const defineFieldMapping = <TUserMap extends ComponentMap>(
  userMapping: TUserMap
) => {
  return {
    ...BASE_MAPPING,
    ...userMapping,
  } as const satisfies ComponentMap
}

/**
 * A typed component signature that preserves JSX generics while still
 * supporting ref forwarding.
 *
 * This is a TypeScript-level construct; at runtime it is a single component.
 */
export type TypedFormComponent<TComponentMap extends ComponentMap> = {
  <TModel extends FieldValues>(
    props: Omit<BlueFormProps<TModel, TComponentMap>, "fieldMapping"> &
      React.RefAttributes<BlueFormRef<TModel>>
  ): JSX.Element
}

export const setupForm = <TComponentMap extends ComponentMap>(
  baseConfig?: BlueFormBaseConfig<TComponentMap>
) => {
  const defineConfig = createDefineConfigFn<TComponentMap>()

  const InternalForm = forwardRef(function InternalForm<
    TModel extends FieldValues
  >(
    props: Omit<BlueFormProps<TModel, TComponentMap>, "fieldMapping">,
    ref: React.Ref<BlueFormRef<TModel>>
  ) {
    // Exclude fieldMapping from props to prevent override at runtime
    const { fieldMapping: _, ...allowedProps } = props as any

    return <BlueForm ref={ref} {...baseConfig} {...allowedProps} />
  })

  /**
   * This cast is intentional:
   * - `forwardRef` returns a non-generic component value (JSX cannot pass generics to values).
   * - We re-type it as a callable generic component to allow `<Form<TModel> />` syntax.
   */
  const Form = InternalForm as unknown as TypedFormComponent<TComponentMap>

  return [Form, defineConfig] as const
}
