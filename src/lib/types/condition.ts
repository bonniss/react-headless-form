import type { FieldValues, Path, PathValue } from "react-hook-form";

/**
 * Operators of a JSON condition. Every operator given must hold (AND); with
 * none, the value must be truthy. Comparison operators only exist for number
 * fields, `matches` only for string fields.
 */
export type ConditionOperators<V> = {
  /** Strictly equal (`===`). */
  eq?: V;
  /** Not strictly equal. */
  neq?: V;
  /** Equal to one of the values. */
  in?: readonly V[];
  /** Equal to none of the values. */
  notIn?: readonly V[];
  /** `null`, `undefined`, `""` or `[]`. */
  empty?: true;
  /** Not `empty`. */
  notEmpty?: true;
} & ([NonNullable<V>] extends [number]
  ? {
      /** Numeric comparisons (numeric strings are converted). */
      gt?: number;
      gte?: number;
      lt?: number;
      lte?: number;
    }
  : { gt?: never; gte?: never; lt?: never; lte?: never }) &
  ([NonNullable<V>] extends [string]
    ? {
        /** Regular expression source, or a `/source/flags` literal. */
        matches?: string;
      }
    : { matches?: never });

/**
 * A single test. `when` is a path relative to the field's scope (its array row
 * or nested section; the form root at the top level). With `from: "root"`,
 * `when` is a path from the form root instead.
 */
export type ConditionLeaf<TModel extends FieldValues, TRoot extends FieldValues = TModel> =
  | {
      [P in Path<TModel>]: { when: P; from?: "scope" } & ConditionOperators<PathValue<TModel, P>>;
    }[Path<TModel>]
  | {
      [P in Path<TRoot>]: { when: P; from: "root" } & ConditionOperators<PathValue<TRoot, P>>;
    }[Path<TRoot>];

/**
 * A JSON-serializable condition for `visible` / `disabled` / `required`, so
 * configs can be stored in a database. Paths and values are type-checked
 * against the model.
 *
 * @example
 * visible: { when: "role", eq: "student" }
 * disabled: { or: [{ when: "status", in: ["paid", "shipped"] }, { when: "locked", eq: true }] }
 * visible: { when: "age", gte: 18, lt: 65 }
 * visible: { when: "role", from: "root", eq: "admin" } // inside an array row
 */
export type Condition<TModel extends FieldValues, TRoot extends FieldValues = TModel> =
  | ConditionLeaf<TModel, TRoot>
  | { and: Condition<TModel, TRoot>[] }
  | { or: Condition<TModel, TRoot>[] }
  | { not: Condition<TModel, TRoot> };
