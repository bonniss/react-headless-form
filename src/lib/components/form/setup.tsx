import type {
  BlueFormBaseConfig,
  BlueFormProps,
  ComponentMap,
  FormConfig,
  FormSectionProps,
} from "@/types"
import type { BlueFormRef } from "@/types/form"
import type { ComponentType, JSX } from "react"
import { forwardRef } from "react"
import type { FieldValues } from "react-hook-form"
import BlueForm from "./BlueForm"

const PlaceholderForNestedField = null as unknown as ComponentType<
  FormSectionProps<any, any>
>
const PlaceholderForHidden = null as unknown as ComponentType<any>
const PlaceholderForInline = null as unknown as ComponentType<any>

export const BASE_MAPPING = {
  hidden: PlaceholderForHidden,
  inline: PlaceholderForInline,
  array: PlaceholderForNestedField,
  section: PlaceholderForNestedField
} as const satisfies ComponentMap
type DefaultComponentMap = typeof BASE_MAPPING

/**
 * Defines the field mapping used by BlueForm.
 *
 * - Can be called without arguments to use the built-in base field types.
 * - When a custom mapping is provided, it is merged with the base mapping.
 *
 * Function overloads are required here to preserve autocomplete and
 * type inference when `userMapping` is omitted.
 */
export function defineMapping(): typeof BASE_MAPPING
export function defineMapping<TUserMap extends ComponentMap>(
  userMapping: TUserMap
): typeof BASE_MAPPING & TUserMap
export function defineMapping(userMapping?: ComponentMap) {
  return {
    ...BASE_MAPPING,
    ...(userMapping ?? {}),
  } as const
}

/**
 * A typed component signature that preserves JSX generics
 * while still supporting ref forwarding.
 *
 * This exists purely at the type level; at runtime, it is
 * a single React component created via `forwardRef`.
 */
export type TypedFormComponent<TComponentMap extends ComponentMap> = {
  <TModel extends FieldValues>(
    props: Omit<BlueFormProps<TModel, TComponentMap>, "fieldMapping"> &
      React.RefAttributes<BlueFormRef<TModel>>
  ): JSX.Element
}

/**
 * Creates a typed helper for defining form configuration objects.
 *
 * This helper exists to bind a form config to a specific component map,
 * allowing field definitions to be type-checked against the form model
 * and available field types.
 */
function createDefineConfigFn<TComponentMap extends ComponentMap>() {
  return function configForm<TModel extends FieldValues>(
    config: FormConfig<TModel, TComponentMap>
  ): FormConfig<TModel, TComponentMap> {
    return config
  }
}

/**
 * Creates a typed Form component and a `defineConfig` helper.
 *
 * - Can be called without arguments to use the built-in base field mapping.
 * - When a base config is provided, its field mapping is locked in and
 *   cannot be overridden at the Form level.
 *
 * Function overloads are required to preserve base mapping inference
 * when `setupForm` is called without arguments or with an empty config.
 */
export function setupForm(): readonly [
  TypedFormComponent<DefaultComponentMap>,
  ReturnType<typeof createDefineConfigFn<DefaultComponentMap>>
]
export function setupForm<TUserMap extends ComponentMap>(
  baseConfig: BlueFormBaseConfig<TUserMap>
): readonly [
  TypedFormComponent<TUserMap>,
  ReturnType<typeof createDefineConfigFn<TUserMap>>
]
export function setupForm(baseConfig?: BlueFormBaseConfig<ComponentMap>) {
  const resolvedConfig = {
    fieldMapping: defineMapping(),
    ...baseConfig,
  }

  const defineConfig = createDefineConfigFn<any>()

  const InternalForm = forwardRef(function InternalForm(props: any, ref) {
    // Prevent overriding `fieldMapping` at the Form level.
    // Field mapping is intentionally fixed at setup time.
    const { fieldMapping: _, ...allowedProps } = props as any

    return <BlueForm ref={ref} {...resolvedConfig} {...allowedProps} />
  })

  return [InternalForm as any, defineConfig] as const
}
