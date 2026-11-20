/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentMap, FormConfig, FormFieldConfig } from "@/types";
import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";

/**
 * A loosely typed field config for configs built at runtime (e.g. from database
 * metadata), where `type` is a plain string and `props` are not known statically.
 */
export type DynamicFieldConfig = Omit<
  FormFieldConfig<FieldValues, ComponentMap>,
  "type" | "props" | "render" | "deps"
> & {
  type: string;
  props?: Record<string, any>;
  render?: (ctx: any) => ReactNode;
  deps?: string[];
};

export type DynamicFormConfig = Record<string, DynamicFieldConfig>;

/**
 * Accepts a runtime-built config without key/type checking and returns it typed
 * so it can be passed to `<Form config>`.
 *
 * Configs are plain data except for functions (`visible`, `validate`, ...);
 * `rules.pattern` can be a string, so most of a config can live in a database.
 * Unknown `type`s still throw at render time.
 *
 * @example
 * const config = defineDynamicConfig(
 *   Object.fromEntries(rows.map((r) => [r.key, { type: r.kind, label: { text: r.label } }])),
 * );
 * <Form config={config} />
 */
export function defineDynamicConfig<
  TModel extends FieldValues = FieldValues,
  TComponentMap extends ComponentMap = any,
>(config: DynamicFormConfig): FormConfig<TModel, TComponentMap> {
  return config as FormConfig<TModel, TComponentMap>;
}
