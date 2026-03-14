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

/**
 * The base component map type.
 *
 * Uses `WithKnownKeys` to allow a mix of known core field types and arbitrary
 * user-defined field types — both mapping to a React component.
 *
 * NOTE: `keyof ComponentMap` technically resolves to `string | number | symbol`
 * because of how TypeScript handles index signatures. This causes issues downstream
 * when `K` is used as a generic constraint expecting `string`. The workaround is
 * to use `K extends string ? K : never` at the call site (see `FieldConfigUnion`).
 */
export type ComponentMap = WithKnownKeys<CoreFieldType, ComponentType<any>>;

/**
 * Configuration for a single form field.
 *
 * @template TModel       - The form's data model. Used to type `visible` and `disabled` callbacks.
 * @template TComponentMap - The field type → component mapping registered via `setupForm`.
 * @template TFieldType   - The specific field type for this config entry (e.g. `"text"`, `"array"`).
 *                          Defaults to the union of all keys in `TComponentMap`.
 *                          When concrete (e.g. `"text"`), TypeScript narrows `props` to the
 *                          exact component's prop type and `render` to the correct context shape.
 *
 * TYPE SAFETY NOTE:
 * `props` is typed as `ComponentProps<TComponentMap[TFieldType]>`.
 * This only resolves correctly when `TFieldType` is a concrete literal (e.g. `"text"`),
 * not when it is the full union. Concreteness is achieved through the discriminated union
 * in `FieldConfigUnion` — each variant fixes `TFieldType` to a single `K`.
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

/**
 * A discriminated union of all possible field configs for a given component map.
 *
 * HOW IT WORKS:
 * We map over every key `K` in `TComponentMap` and produce a `FormFieldConfig`
 * with `TFieldType` fixed to that specific `K`. The result is a union of
 * per-type configs, each with a concrete `type` discriminant.
 *
 * This is what enables TypeScript to narrow `props` correctly:
 *   { type: "text", props: ... }  →  props is InputFieldProps
 *   { type: "select", props: ... } →  props is SelectFieldProps
 *
 * WHY `K extends string ? K : never`:
 * `keyof TComponentMap` can be `string | number | symbol` due to TypeScript's
 * index signature handling (see ComponentMap note above). Since `FormFieldConfig`
 * requires `TFieldType extends string`, we must narrow `K` to `string` here.
 * `number` and `symbol` keys are not valid in practice — React component props
 * never use them — so `never`-ing them out is safe.
 *
 * WHY NOT `[K in keyof TComponentMap & string]`:
 * Constraining the mapped type key with `& string` does NOT propagate the
 * narrowing into `K` when used as a generic argument. The `extends string ? K : never`
 * pattern is the only reliable way to satisfy the constraint at the call site.
 */
type FieldConfigUnion<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> = {
  [K in keyof TComponentMap]: FormFieldConfig<
    TModel,
    TComponentMap,
    K extends string ? K : never
  > & {
    type: K;
  };
}[keyof TComponentMap];

/**
 * Virtual field keys — config keys that exist purely for layout/UI purposes
 * and do not correspond to any key in the data model.
 *
 * Convention: prefix with `__` (double underscore) to signal intent.
 * These keys are excluded from the form submission payload by design.
 *
 * Example: `__addressSection`, `__divider`, `__tabGroup`
 *
 * @see section docs for usage with `nested: false`
 */
type VirtualFieldKey = `__${string}`;

/**
 * The top-level form configuration type.
 *
 * Maps every key in the data model (via RHF's `Path<TModel>`) plus any virtual
 * layout keys to an optional field config entry.
 *
 * KEY DESIGN:
 * - `Path<TModel>` includes dot-notation paths (e.g. `"profile.firstName"`).
 *   In practice, only top-level keys are used here — nested fields are defined
 *   inside `props.config` of their parent `section` or `array`.
 *   Deep paths are valid TypeScript but discouraged at this level.
 * - `VirtualFieldKey` allows layout-only entries that TypeScript would otherwise
 *   reject as unknown keys.
 *
 * VALUE DESIGN:
 * Each value is a `FieldConfigUnion` — a discriminated union where `type` narrows
 * `props` to the correct component's prop type. This is the mechanism that gives
 * BlueForm its end-to-end type safety from field config to component props.
 */
export type FormConfig<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> = {
  [K in Path<TModel> | VirtualFieldKey]?: FieldConfigUnion<
    TModel,
    TComponentMap
  >;
};
