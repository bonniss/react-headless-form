import { typedKeys } from './typed-keys';

/**
 * Resolves validation rules against the i18n validationResolver without mutating
 * the original config object.
 *
 * Previously, the engine was doing `rules[ruleType] = resolvedRule` directly on
 * the destructured reference, which mutated the user's config object in place.
 * This caused:
 *   - Rules accumulating transformed values across re-renders (wrong input on 2nd render)
 *   - React StrictMode double-invoke producing corrupted rule objects
 *   - Shared config (e.g. array item config reused across instances) cross-contaminating
 */
export function resolveRules(
  rules: Record<string, any>,
  validationResolver: Record<string, any>,
  translatedLabel: string | null | undefined,
): Record<string, any> {
  // Fast path: nothing to resolve
  if (!Object.keys(rules).length || !Object.keys(validationResolver).length) {
    return rules;
  }

  let resolved: Record<string, any> | null = null;

  for (const ruleType of typedKeys(rules)) {
    const rule = rules[ruleType];
    const resolver = validationResolver[ruleType];
    if (!rule || !resolver) continue;

    const resolvedRule = resolver({
      field: translatedLabel!,
      rule: rule as any,
    });
    if (!resolvedRule) continue;

    // Lazy-clone: only allocate a new object if we actually need to change something
    if (!resolved) resolved = { ...rules };
    resolved[ruleType] = resolvedRule;
  }

  // Return original if nothing changed, shallow clone with overrides otherwise
  return resolved ?? rules;
}
