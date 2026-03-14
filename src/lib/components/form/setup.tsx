import type {
  BlueFormBaseConfig,
  BlueFormProps,
  ComponentMap,
  FormConfig,
  FormSectionProps,
} from "@/types";
import type { BlueFormRef } from "@/types/form";
import type { ComponentType, JSX } from "react";
import { forwardRef } from "react";
import type { FieldValues } from "react-hook-form";
import BlueForm from "./BlueForm";
import { useField } from "./provider";
import BlueFormEngine from "./internal/BlueFormEngine";

/**
 * Placeholder components used to satisfy the type-level `ComponentMap`.
 *
 * These are never rendered at runtime:
 * - `hidden` and `inline` are handled by built-in components in the engine.
 * - `array` and `section` are handled directly inside `BlueFormEngine`.
 *
 * The mapping exists to:
 * - register built-in field types for type-checking / autocomplete
 * - allow `defineMapping()` to merge user mappings with a stable base set
 */
const PlaceholderForNestedField = null as unknown as ComponentType<
  FormSectionProps<any, any>
>;
const PlaceholderForHidden = null as unknown as ComponentType<any>;
const PlaceholderForInline = null as unknown as ComponentType<any>;

/**
 * Built-in field type registry.
 *
 * This constant is used as the base mapping for `defineMapping()`.
 * Users can extend/override mapping entries by calling `defineMapping(userMap)`.
 */
export const BASE_MAPPING = {
  hidden: PlaceholderForHidden,
  inline: PlaceholderForInline,
  array: PlaceholderForNestedField,
  section: PlaceholderForNestedField,
} as const satisfies ComponentMap;

type DefaultComponentMap = typeof BASE_MAPPING;

/**
 * Defines the field mapping used by the form engine.
 *
 * - Call without arguments to use only the built-in base field types.
 * - Pass a user mapping to merge/extend the base mapping.
 *
 * Overloads are used to preserve autocomplete and type inference when
 * `userMapping` is omitted.
 */
export function defineMapping(): typeof BASE_MAPPING;
export function defineMapping<TUserMap extends ComponentMap>(
  userMapping: TUserMap,
): typeof BASE_MAPPING & TUserMap;
export function defineMapping(userMapping?: ComponentMap) {
  return {
    ...BASE_MAPPING,
    ...(userMapping ?? {}),
  } as const;
}

/**
 * A typed `<Form />` component signature.
 *
 * This is a type-level helper that preserves JSX generics while still allowing
 * `ref` forwarding. At runtime, it is implemented by a single React component
 * created via `forwardRef`.
 */
export type TypedFormComponent<TComponentMap extends ComponentMap> = {
  <TModel extends FieldValues>(
    props: Omit<BlueFormProps<TModel, TComponentMap>, "fieldMapping"> &
      React.RefAttributes<BlueFormRef<TModel>>,
  ): JSX.Element;
};

/**
 * A typed `<Section />` component signature.
 *
 * `<Section />` renders a form config fragment at the *current section namespace*.
 * The namespace is taken from `useField()` (provided by the section field's
 * internal `FieldProvider` wrapper).
 *
 * Usage:
 * - `<Section<MySubModel> config={defineConfig<MySubModel>({...})} />`
 */
export type TypedSectionComponent<TComponentMap extends ComponentMap> = {
  <TModel extends FieldValues>(props: {
    config: FormConfig<TModel, TComponentMap>;
  }): JSX.Element;
};

/**
 * Creates a typed helper for defining form configuration objects.
 *
 * The returned `defineConfig` function:
 * - binds a config object to a specific component map
 * - allows field definitions to be type-checked against a model type
 * - improves autocomplete for field types and props
 */
function createDefineConfigFn<TComponentMap extends ComponentMap>() {
  return function defineConfig<TModel extends FieldValues>(
    config: FormConfig<TModel, TComponentMap>,
  ): FormConfig<TModel, TComponentMap> {
    return config;
  };
}

/**
 * Creates an internal `<Section />` component bound to a component map.
 *
 * At runtime, `<Section />`:
 * - reads the current section namespace via `useField()`
 * - renders the provided config fragment using `BlueFormEngine`
 *
 * Note:
 * - `<Section />` must be rendered under a section field (or any place where
 *   `FieldProvider` supplies the correct field context), otherwise `useField()`
 *   may throw or return undefined context depending on implementation.
 */
function createSectionComponent<TComponentMap extends ComponentMap>() {
  const InternalSection = function InternalSection(props: any) {
    const { namespace } = useField();
    return <BlueFormEngine config={props.config} namespace={namespace} />;
  };

  return InternalSection as TypedSectionComponent<TComponentMap>;
}

/**
 * Creates a typed `<Form />` component, a `defineConfig()` helper, and a typed
 * `<Section />` helper.
 *
 * - Call without arguments to use the built-in base mapping.
 * - If a base config is provided, its `fieldMapping` is locked at setup time and
 *   cannot be overridden per-form instance.
 *
 * Overloads are used to preserve base mapping inference when `setupForm` is
 * called without arguments or with an empty config.
 *
 * Returns a tuple:
 * - `[Form, defineConfig, Section]`
 */
export function setupForm(): readonly [
  TypedFormComponent<DefaultComponentMap>,
  ReturnType<typeof createDefineConfigFn<DefaultComponentMap>>,
  TypedSectionComponent<DefaultComponentMap>,
];
export function setupForm<TUserMap extends ComponentMap>(
  baseConfig: BlueFormBaseConfig<TUserMap>,
): readonly [
  TypedFormComponent<TUserMap>,
  ReturnType<typeof createDefineConfigFn<TUserMap>>,
  TypedSectionComponent<TUserMap>,
];
export function setupForm(baseConfig?: BlueFormBaseConfig<ComponentMap>) {
  const resolvedConfig = {
    fieldMapping: defineMapping(),
    ...baseConfig,
  };

  const defineConfig = createDefineConfigFn<any>();

  const InternalForm = forwardRef(function InternalForm(props: any, ref) {
    const {
      fieldMapping: _ignored,
      formOptions,
      ...allowedProps
    } = props as any;

    // Merge formOptions so that per-form options override setup-level defaults,
    // while setup-level options serve as the baseline for every form instance.
    const mergedFormOptions = {
      ...resolvedConfig.formOptions,
      ...formOptions,
    };

    return (
      <BlueForm
        ref={ref}
        {...resolvedConfig}
        {...allowedProps}
        formOptions={mergedFormOptions}
      />
    );
  });

  const Section = createSectionComponent<any>();
  return [InternalForm as any, defineConfig, Section] as const;
}
