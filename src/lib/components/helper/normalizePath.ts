export interface NormalizePathOptions {
  name: string | string[]
  namespace?: string
}

/**
 * Normalize a field name by combining it with an optional namespace.
 *
 * - If `name` is a string, it returns: `${namespace}.${name}` (if namespace exists)
 * - If `name` is a string[], it returns each name prefixed by namespace.
 * - If `namespace` is not provided, returns name as-is.
 */
export function normalizePath({ name, namespace }: NormalizePathOptions): string | string[] {
  if (!namespace) return name

  if (Array.isArray(name)) {
    return name.map((n) => `${namespace}.${n}`)
  }

  return `${namespace}.${name}`
}
