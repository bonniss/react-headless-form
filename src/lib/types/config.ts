/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TranslatableText } from "@/components/i18n";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import type { FieldResolvedProps } from "./input";
import type { FieldValues, Path, PathValue } from "react-hook-form";
import type { Condition } from "./condition";
import type { RenderFn } from "./render";
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
 * Content of a field slot: a node, or a function of the field's resolved props.
 */
type PropsOf<C> = C extends ComponentType<infer P> ? P : never;

export type FieldSlotContent =
  | ReactNode
  | ((field: FieldResolvedProps) => ReactNode);

/**
 * Second argument of `visible` / `disabled` / `required` functions.
 */
export type ConditionContext<TScope = any> = {
  /** Full path of the field, e.g. `"rows.2.detail"`. */
  path: string;
  /** Config key of the field, e.g. `"detail"`. */
  name: string;
  /** Path of the enclosing array row or nested section, e.g. `"rows.2"`. */
  namespace?: string;
  /**
   * Values at `namespace` (the current array row or nested section), or the
   * whole form values at the top level. Reads are tracked like `values`.
   * Typed by the config's model (e.g. the row model in `defineConfig<Row, Root>`).
   */
  scope: Partial<TScope>;
};

/**
 * Type of `values` in condition / compute functions: the root model, or `any`
 * when the root is unknown (configs returned by `defineConfig` drop it).
 */
type RootValues<TRoot> = [TRoot] extends [never] ? any : Partial<TRoot>;

/**
 * A `visible` / `disabled` / `required` function. `values` are the whole form
 * values (typed by the root model); `ctx.scope` the values of the field's array
 * row / nested section (typed by the config's model).
 */
export type ConditionFn<TModel extends FieldValues, TRoot extends FieldValues = TModel> = (
  values: RootValues<TRoot>,
  ctx: ConditionContext<TModel>,
) => boolean;

/**
 * Derives a field's value from other values (same arguments as conditions).
 * Return `undefined` when the inputs are incomplete.
 */
export type ComputeFn<TModel extends FieldValues, TRoot extends FieldValues, TValue> = (
  values: RootValues<TRoot>,
  ctx: ConditionContext<TModel>,
) => TValue | undefined;

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
  TRoot extends FieldValues = TModel,
> = {
  /**
   * The type of field, used to select the appropriate renderer component.
   * Must match a key in the component map.
   */
  type: TFieldType;

  /**
   * Props to pass to the renderer component associated with the field type.
   */
  props?: TFieldType extends "section" | "array"
    ? // Nested config is checked against the same component map, so unknown
      // `type`s and wrong `props` inside sections/arrays are errors too.
      // (Model keys inside are only checked with `defineConfig<SubModel>()`.)
      Omit<PropsOf<TComponentMap[TFieldType]>, "config"> & {
        // `TRoot` keeps `from: "root"` conditions checked inside nested configs.
        config?: FormConfig<any, TComponentMap, TRoot>;
      }
    : ComponentProps<TComponentMap[TFieldType]>;

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
   * based on the current form values. The second argument gives the field's
   * position and the values of its enclosing array row / nested section.
   *
   * @example
   * // inside an array item config: show `detail` when this row's `kind` is "other"
   * detail: { type: "text", visible: (_, { scope }) => scope?.kind === "other" }
   */
  visible?: boolean | ConditionFn<TModel, TRoot> | Condition<TModel, TRoot>;

  /**
   * Optional function to determine whether the field should be disabled,
   * based on the current form values (same arguments as `visible`).
   */
  disabled?: boolean | ConditionFn<TModel, TRoot> | Condition<TModel, TRoot>;

  /**
   * Marks the field as required in the UI (`useField().required`, e.g. to show "*").
   * Accepts a function of the current form values for conditionally required fields.
   *
   * This only affects the resolved `required` flag; enforce the rule itself with
   * `rules.validate` or your schema. When omitted, it is inferred from `rules.required`.
   */
  required?: boolean | ConditionFn<TModel, TRoot> | Condition<TModel, TRoot>;

  /**
   * Form paths that `visible` / `disabled` / `required` functions depend on.
   *
   * Optional: by default the paths are inferred by recording which values the
   * functions read (re-recorded on every evaluation), and the field re-renders
   * only when the result of a function changes. Declaring `deps` overrides the
   * inference: the functions are then re-evaluated only when one of these
   * paths changes. Paths are absolute (e.g. `"profile.role"`).
   */
  deps?: Path<TModel>[];

  /**
   * Extra UI rendered right before / after this field, inside the field context
   * (so components in a slot can call `useField()`). A function receives the
   * resolved field props, including the current `value`.
   *
   * @example
   * slots: { after: ({ value }) => <AiReview text={value} /> }
   */
  slots?: {
    before?: FieldSlotContent;
    after?: FieldSlotContent;
  };

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
  TRoot extends FieldValues = TModel,
> = {
  [K in keyof TComponentMap]: FormFieldConfig<
    TModel,
    TComponentMap,
    K extends string ? K : never,
    TRoot
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
  TRoot extends FieldValues = TModel,
> = {
  [K in Path<TModel> | VirtualFieldKey]?: FieldConfigUnion<
    TModel,
    TComponentMap,
    TRoot
  > & {
    /**
     * Derives this field's value from other values; the return type is this
     * field's type. Re-runs when a value it reads changes (like conditions).
     *
     * - `readOnly` / `disabled` fields always follow the computed value.
     * - Editable fields follow it until the user changes the field (an existing
     *   value that differs from the computed one counts as a change); clearing
     *   the field resumes syncing on the next change.
     *
     * @example
     * bmi: { type: "number", readOnly: true, compute: (v) => v.weight && v.height ? v.weight / (v.height / 100) ** 2 : undefined }
     * slug: { type: "text", compute: (v) => slugify(v.title ?? "") }
     */
    compute?: ComputeFn<TModel, TRoot, K extends Path<TModel> ? PathValue<TModel, K> : unknown>;
  };
};
