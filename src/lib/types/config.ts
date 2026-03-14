/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TranslatableText } from "@/components/i18n";
import type { ComponentProps, ComponentType } from "react";
import type { FieldValues, Path } from "react-hook-form";
import { RenderFn } from "./render";
import type { ValidationRules } from "./rule";
import type { WithKnownKeys } from "./utils";

/**
 * Core field types used for logical structuring or custom handling in dynamic forms.
 *
 * - 'hidden': A non-visible field that does not render any UI,
 *   but participates fully in form state — its defaultValue is registered,
 *   it can be validated, and it will be included in the submission payload.
 *   Useful for passing fixed values or storing internal state without user interaction.
 *   Equivalent in behavior to an <input type="hidden" />, but fully integrated into the form engine.
 *
 * - 'array': A repeatable list of sub-items. Represents a field with type T[].
 *   Typically rendered with "Add/Remove" item functionality via `useArrayField`.
 *
 * - 'section': A structural container for grouping related fields.
 *   When `nested: false` (default), fields inside remain at the current level in form state.
 *   When `nested: true`, the section key becomes a namespace boundary in the submission payload.
 *
 * - 'inline': A field rendered manually using a `render` function.
 *   Useful for one-off or highly specialized components that don't fit into the standard fieldMapping.
 *   Requires full control from the developer.
 */
export type CoreFieldType = "section" | "array" | "hidden" | "inline";
export type ComponentMap = WithKnownKeys<CoreFieldType, ComponentType<any>>;

/**
 * Configuration for a single form field in a dynamic form engine.
 *
 * @template TFieldType - Field type identifier (e.g., 'text', 'select', 'checkbox'), used to map to a renderer.
 * @template TModel - The form's overall data model (typically inferred from react-hook-form).
 * @template TComponentMap - A mapping of field types to component prop types.
 */
export type FormFieldConfig<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
  TFieldType extends string & keyof TComponentMap = string &
    keyof TComponentMap,
> = {
  /**
   * The type of field, used to select the appropriate renderer component.
   * Must match a key in the component map.
   */
  type: TFieldType;

  /**
   * Props to pass to the renderer component associated with the field type.
   */
  props?: ComponentProps<TComponentMap[TFieldType]>;

  /**
   * Field name, used as a key in the form state.
   */
  name?: string;

  /**
   * Validation rules applied to this field (compatible with React Hook Form).
   */
  rules?: ValidationRules;

  /**
   * Default value to use when the field has no initial value from the form.
   */
  defaultValue?: any;

  /**
   * Main label of the field (supports translation).
   */
  label?: TranslatableText;

  /**
   * Optional helper text or field-level description (supports translation).
   */
  description?: TranslatableText;

  /**
   * When true, the field is rendered in read-only mode.
   * Users can see the value but cannot edit it. Typically styled differently from `disabled`.
   */
  readOnly?: boolean;

  /**
   * Optional function to determine whether the field should be visible,
   * based on the current form values.
   */
  visible?: boolean | ((values: Partial<TModel>) => boolean);

  /**
   * Optional function to determine whether the field should be disabled,
   * based on the current form values.
   */
  disabled?: boolean | ((values: Partial<TModel>) => boolean);

  /**
   * Optional render override for the field.
   *
   * When provided, the entire rendering of this field is delegated to this function.
   * The behavior and available context depends on the field type:
   *
   * **Regular fields** (`inline`, custom mapped types):
   * Receives `FieldResolvedProps` — use this to render a fully custom field UI.
   * `children` is `undefined`.
   *
   * ```tsx
   * render: ({ value, onChange, label, errorMessage }) => (
   *   <MyCustomInput value={value} onChange={onChange} label={label} />
   * )
   * ```
   *
   * **`section`**:
   * Receives `FieldResolvedProps` + `children` (the rendered fields inside the section).
   * Use this to wrap the section in a custom container.
   *
   * ```tsx
   * render: ({ children, label }) => (
   *   <Card title={label}>{children}</Card>
   * )
   * ```
   *
   * **`array`**:
   * Receives `FieldResolvedProps` + `ArrayFieldContext` + `children` (all items rendered via `renderItems()`).
   * Array helpers (`append`, `remove`, `items`...) are available directly in context —
   * no need to call `useArrayField()` or extract to a separate component.
   *
   * ```tsx
   * render: ({ children, items, append, remove, label, errorMessage }) => (
   *   <fieldset>
   *     <legend>{label}</legend>
   *     {children}
   *     {errorMessage && <div>{errorMessage}</div>}
   *     <button type="button" onClick={() => append({})}>Add</button>
   *   </fieldset>
   * )
   * ```
   *
   * @see {@link ArrayFieldContext} for the full list of array helpers available in context.
   */
  render?: RenderFn<TFieldType>;
};

type FieldConfigUnion<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> = {
  [K in keyof TComponentMap]: FormFieldConfig<TModel, TComponentMap, K> & {
    type: K;
  };
}[keyof TComponentMap];

type VirtualFieldKey = `__${string}`;

export type FormConfig<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> = {
  [K in Path<TModel> | VirtualFieldKey]?: FieldConfigUnion<
    TModel,
    TComponentMap
  >;
};
