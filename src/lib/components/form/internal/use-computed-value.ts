/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { set, useFormContext } from "react-hook-form";

import { readPath } from "@/components/helper/condition";
import { isRelatedPath, trackReads } from "@/components/helper/track-reads";
import type { ConditionContext, FormFieldConfig } from "@/types";

type FieldPosition = Omit<ConditionContext, "scope">;

const MAX_CHAIN = 50;
const NOT_WRITTEN = Symbol("not-written");

const isEmpty = (v: unknown) => v == null || v === "";

export function isEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => isEqual(a[k], b[k]));
}

// Synchronous compute chains per form, to stop cycles (a → b → a → ...).
// `stopped` blocks the rest of a chain once a cycle was reported: RHF notifies
// twice per setValue, so an unblocked cycle would branch exponentially.
type Chain = { paths: string[]; stopped: boolean; quiet: boolean };
const chains = new WeakMap<object, Chain>();

// There is no public API to set a default during reset() (resetField needs a
// registered field, and reset() has just dropped the registry).
function setDefault(control: any, path: string, value: unknown) {
  if (control._defaultValues) set(control._defaultValues, path, value);
}

function stopChain(chain: Chain, path: string) {
  chain.stopped = true;
  console.error(
    `[react-headless-form] \`compute\` cycle detected at "${path}": ${[...chain.paths.slice(-6), path].join(" → ")}`,
  );
}

/**
 * Keeps a field's value in sync with its `compute` function.
 *
 * Re-runs when a path the function read (or a declared `dep`) changes. Values
 * written on mount or after `reset()` become the field's default, so the form
 * stays pristine. Editable fields stop following the computed value once the
 * user changes them; `readOnly` / `disabled` fields always follow it.
 */
export function useComputedValue(
  field: FormFieldConfig<any, any>,
  position: FieldPosition,
  editable: boolean,
) {
  const { getValues, watch, setValue, getFieldState, control } = useFormContext();
  const hasCompute = typeof (field as any).compute === "function";
  const latest = useRef({ field, position, editable });
  latest.current = { field, position, editable };
  const state = useRef<{ deps: string[] | null; written: unknown; running: boolean }>({
    deps: [],
    written: NOT_WRITTEN,
    running: false,
  });

  useEffect(() => {
    if (!hasCompute) return;
    const own = state.current;

    // `changed` is the changed path; undefined on mount and after reset().
    const run = (changed?: string) => {
      const { field, position, editable } = latest.current;
      const { path, namespace } = position;
      if (changed && own.deps && !own.deps.some((dep) => isRelatedPath(dep, changed))) return;

      const chain = chains.get(control) ?? { paths: [], stopped: false, quiet: false };
      if (chain.stopped) return;
      if (own.running) {
        // A change to one of our deps while we are writing: a cycle. (Our own
        // write on mount / reset notifies without a name; that is ignored.)
        if (changed && changed !== path) stopChain(chain, path);
        return;
      }

      const values = getValues();
      const declared = Array.isArray(field.deps) ? (field.deps as string[]) : undefined;
      const tracker = declared ? undefined : trackReads(values ?? {});
      const scope = tracker
        ? tracker.at(namespace ?? "")
        : namespace
          ? readPath(values, namespace)
          : values;
      const next = (field as any).compute(tracker ? tracker.proxy : values, { ...position, scope });
      own.deps = declared ?? tracker!.deps();

      const current = readPath(values, path);
      const quiet = chain.paths.length ? chain.quiet : !changed;
      if (isEqual(next, current)) {
        own.written = next;
        // Mount / reset(): make sure the default has the key too (even when
        // `undefined`), or RHF's deep dirty check sees a missing key.
        if (quiet) setDefault(control, path, next);
        return;
      }
      // The user (or saved data) changed an editable field: keep their value.
      if (editable && !isEmpty(current) && !(own.written !== NOT_WRITTEN && isEqual(current, own.written))) {
        return;
      }

      if (chain.paths.length >= MAX_CHAIN) {
        stopChain(chain, path);
        return;
      }
      // A chain started by mount / reset() stays quiet (not dirty) all the way.
      if (!chain.paths.length) chain.quiet = quiet;
      chain.paths.push(path);
      chains.set(control, chain);
      own.running = true;
      try {
        own.written = next;
        if (!chain.quiet) {
          setValue(path, next, {
            shouldDirty: true,
            shouldValidate:
              Boolean((control as any)._formState?.isSubmitted) || !!getFieldState(path).error,
          });
        } else {
          // Mount / reset(): not dirty; the value becomes the field's default.
          // Defaults first: before mount, getValues() (used by the computes
          // our setValue notifies) reads the defaults.
          setDefault(control, path, next);
          setValue(path, next);
        }
      } finally {
        own.running = false;
        chain.paths.pop();
        if (!chain.paths.length) chain.stopped = false;
      }
    };

    // `watch(callback)` receives the raw payload: `name` is the changed path,
    // or undefined for reset() (subscribe() would merge a stale name).
    const subscription = watch((_, { name }) => run(name));
    run();
    return () => subscription.unsubscribe();
  }, [hasCompute, getValues, watch, setValue, getFieldState, control]);
}
