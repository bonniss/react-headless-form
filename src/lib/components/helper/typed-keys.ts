/**
 * Type-safe wrapper around `Object.keys`.
 *
 * `Object.keys` returns `string[]` by design — TypeScript intentionally widens
 * the return type because objects may have extra keys at runtime that are not
 * reflected in the static type. This is correct in general, but inconvenient
 * when iterating over a known object where you need `keyof T` for type narrowing.
 *
 * Use this when you own the object and are certain no extra keys exist at runtime.
 *
 * @example
 * const config = { text: InputField, select: SelectField }
 * typedKeys(config).forEach((key) => {
 *   // key is "text" | "select", not string
 * })
 */
export const typedKeys = <T extends object>(obj: T) =>
  Object.keys(obj) as Array<keyof T>;
