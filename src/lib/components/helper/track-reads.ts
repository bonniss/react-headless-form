/* eslint-disable @typescript-eslint/no-explicit-any */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const join = (prefix: string, key: string) => (prefix ? `${prefix}.${key}` : key);

/**
 * Wraps form values in a Proxy that records which paths are read.
 *
 * - Reading a nested plain object returns another tracking proxy, so
 *   `v.profile.role` records `profile.role` (not all of `profile`).
 * - Arrays, dates and other non-plain values are recorded as a whole path:
 *   `v.rows.length` or `v.rows.some(...)` records `rows`.
 * - Enumerating an object (`Object.keys`, spread, `JSON.stringify`, `in`) records
 *   that object as a whole; enumerating the root means "depends on everything".
 *
 * `deps()` returns the minimal list of paths (no path is a descendant of
 * another), or `null` when the reader depends on the whole form.
 */
export function trackReads<T extends object>(values: T) {
  const reads = new Set<string>();
  const traversed = new Set<string>();
  let all = false;

  const readWhole = (prefix: string) => {
    if (prefix) reads.add(prefix);
    else all = true;
  };

  const wrap = (target: Record<string, unknown>, prefix: string): any =>
    new Proxy(target, {
      get(t, key, receiver) {
        const value = Reflect.get(t, key, receiver);
        if (typeof key === "symbol") {
          readWhole(prefix);
          return value;
        }
        const path = join(prefix, key);
        const desc = Reflect.getOwnPropertyDescriptor(t, key);
        // Proxy invariant: a non-configurable, read-only property must be
        // returned as is, so it cannot be wrapped.
        const wrappable = !desc || desc.configurable || desc.writable;
        if (wrappable && isPlainObject(value)) {
          traversed.add(path);
          return wrap(value, path);
        }
        reads.add(path);
        return value;
      },
      has(t, key) {
        if (typeof key === "symbol") readWhole(prefix);
        else reads.add(join(prefix, key));
        return Reflect.has(t, key);
      },
      ownKeys(t) {
        readWhole(prefix);
        return Reflect.ownKeys(t);
      },
      getOwnPropertyDescriptor(t, key) {
        if (typeof key === "symbol") readWhole(prefix);
        else reads.add(join(prefix, key));
        return Reflect.getOwnPropertyDescriptor(t, key);
      },
    });

  const proxy = (isPlainObject(values) ? wrap(values, "") : values) as T;

  const deps = (): string[] | null => {
    if (all || !isPlainObject(values)) return null;
    const paths = [...reads, ...traversed];
    const hasDescendant = (p: string) => paths.some((q) => q.startsWith(`${p}.`));
    // A traversed object counts only when nothing below it was read
    // (e.g. `v.profile !== undefined`).
    const candidates = new Set([
      ...reads,
      ...[...traversed].filter((p) => !hasDescendant(p)),
    ]);
    const list = [...candidates];
    return list.filter(
      (p) => !list.some((q) => q !== p && p.startsWith(`${q}.`)),
    );
  };

  return { proxy, deps };
}

/** True when a change at `changed` can affect a value read at `dep` (or vice versa). */
export function isRelatedPath(dep: string, changed: string): boolean {
  return (
    dep === changed ||
    dep.startsWith(`${changed}.`) ||
    changed.startsWith(`${dep}.`)
  );
}
