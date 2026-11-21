/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldErrors, type FieldValues, type Resolver, get, set } from "react-hook-form";

/**
 * Standard Schema v1 (https://standardschema.dev), copied as the spec allows so
 * that no runtime or type dependency is needed. Implemented by zod (3.24+ / 4),
 * valibot (1.x), arktype (2.x) and others.
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly "~standard": StandardSchemaProps<Input, Output>;
}

export interface StandardSchemaProps<Input = unknown, Output = Input> {
  readonly version: 1;
  readonly vendor: string;
  readonly validate: (
    value: unknown,
  ) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
  readonly types?: { readonly input: Input; readonly output: Output } | undefined;
}

export type StandardSchemaResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardSchemaIssue> };

export interface StandardSchemaIssue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined;
}

/** Input type of a Standard Schema (the form values). */
export type InferSchemaInput<S extends StandardSchemaV1> = NonNullable<
  S["~standard"]["types"]
>["input"];

/** Output type of a Standard Schema (what `onSubmit` receives). */
export type InferSchemaOutput<S extends StandardSchemaV1> = NonNullable<
  S["~standard"]["types"]
>["output"];

function issuePath(issue: StandardSchemaIssue): string {
  return (issue.path ?? [])
    .map((segment) =>
      String(typeof segment === "object" && segment !== null ? segment.key : segment),
    )
    .join(".");
}

/**
 * Builds a react-hook-form resolver from a Standard Schema. On success RHF
 * passes the schema output to `handleSubmit`; on failure the first issue per
 * path becomes the field error (array-level issues go to `<path>.root`, like
 * `useFieldArray` rules).
 */
export function standardSchemaResolver<TInput extends FieldValues, TOutput>(
  schema: StandardSchemaV1<TInput, TOutput>,
): Resolver<TInput, any, TOutput> {
  return (async (values: TInput) => {
    const result = await schema["~standard"].validate(values);
    if (!result.issues) return { values: result.value, errors: {} };

    const errors: FieldErrors = {};
    for (const issue of result.issues) {
      let path = issuePath(issue) || "root";
      if (path !== "root" && Array.isArray(get(values, path))) path = `${path}.root`;
      if (get(errors, path)) continue;
      set(errors, path, { type: "schema", message: issue.message });
    }
    return { values: {}, errors };
  }) as Resolver<TInput, any, TOutput>;
}
