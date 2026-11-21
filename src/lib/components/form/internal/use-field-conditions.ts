/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useReducer, useRef } from "react";
import { useFormContext } from "react-hook-form";

import { isRelatedPath, trackReads } from "@/components/helper/track-reads";
import type { ConditionContext, FormFieldConfig } from "@/types";

type FieldPosition = Omit<ConditionContext, "scope">;

export type FieldConditions = {
  visible: boolean;
  disabled: boolean;
  required: boolean;
};

type Evaluation = {
  result: FieldConditions;
  /** Paths the functions depend on; `null` means "any change". */
  deps: string[] | null;
};

export function isConditionalField(field: any): boolean {
  return (
    typeof field?.visible === "function" ||
    typeof field?.disabled === "function" ||
    typeof field?.required === "function"
  );
}

function scopeOf(values: any, namespace?: string) {
  if (!namespace) return values;
  let target = values;
  for (const key of namespace.split(".")) target = target?.[key];
  return target;
}

function evaluate(
  field: FormFieldConfig<any, any>,
  position: FieldPosition,
  getValues: () => any,
): Evaluation {
  const { visible = true, disabled = false, required, rules } = field;
  const conditional = isConditionalField(field);
  const declared = Array.isArray(field.deps) ? (field.deps as string[]) : undefined;
  // Static fields never read values (getValues() copies the form).
  const tracker = !conditional || declared ? undefined : trackReads(getValues() ?? {});
  const values = !conditional ? undefined : tracker ? tracker.proxy : getValues();
  const ctx = conditional
    ? ({
        ...position,
        scope: tracker
          ? tracker.at(position.namespace ?? "")
          : scopeOf(values, position.namespace),
      } as ConditionContext)
    : undefined;

  // Results are coerced to booleans: `(v) => v.locked` may return undefined.
  const result: FieldConditions = {
    visible: typeof visible === "function" ? !!visible(values, ctx!) : visible !== false,
    disabled: typeof disabled === "function" ? !!disabled(values, ctx!) : !!disabled,
    // `required` only drives the UI flag (e.g. "*"); validation stays in `rules`.
    required:
      required === undefined
        ? Boolean(rules?.required)
        : typeof required === "function"
          ? !!required(values, ctx!)
          : !!required,
  };

  // `null` from the tracker means "any change"; static fields have no deps.
  return { result, deps: declared ?? (tracker ? tracker.deps() : []) };
}

const sameResult = (a: FieldConditions, b: FieldConditions) =>
  Object.is(a.visible, b.visible) &&
  Object.is(a.disabled, b.disabled) &&
  Object.is(a.required, b.required);

/**
 * Runtime evaluation of `visible` / `disabled` / `required` for one field.
 *
 * - Static values: no subscription at all.
 * - Functions: evaluated on every render of the field (so closures over
 *   non-form state still update when the parent re-renders), and re-evaluated
 *   on form value changes that touch their deps — declared `deps`, or paths
 *   recorded while the functions ran. The field re-renders only when a result
 *   actually changes.
 */
export function useFieldConditions(
  field: FormFieldConfig<any, any>,
  position: FieldPosition,
): FieldConditions {
  const { getValues, subscribe } = useFormContext();
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const conditional = isConditionalField(field);

  const current = evaluate(field, position, getValues);
  // Written during render (not in a layout effect) to keep mount cheap for
  // large forms; a discarded render only leaves slightly stale deps, and the
  // subscription always re-evaluates with fresh values.
  const latest = useRef({ field, position, ...current });
  latest.current = { field, position, ...current };

  useEffect(() => {
    if (!conditional) return;

    const check = (changed?: string) => {
      const state = latest.current;
      if (changed && state.deps && !state.deps.some((dep) => isRelatedPath(dep, changed))) {
        return;
      }
      let next: Evaluation;
      try {
        next = evaluate(state.field, state.position, getValues);
      } catch {
        // Let the render surface the error.
        rerender();
        return;
      }
      if (!sameResult(next.result, state.result)) rerender();
      // Same result, but the functions may now read different paths
      // (e.g. `a && b` once `a` becomes truthy).
      else state.deps = next.deps;
    };

    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ name }: { name?: string }) => check(name),
    });
    // Catch changes made between render and subscription.
    check();
    return unsubscribe;
  }, [conditional, subscribe, getValues]);

  return current.result;
}
