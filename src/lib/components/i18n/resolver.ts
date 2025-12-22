import { TranslatableText, TranslateFn } from '.';

/**
 * Normalizes a translation function so it can resolve TranslatableText.
 *
 * The returned function is still called `t`, but now accepts both:
 * - string (shorthand translation key)
 * - TranslatableText object (message, params, fallback)
 *
 * The input `t` can come from any i18n solution or custom implementation.
 */
export const normalizeTranslator =
  (t: TranslateFn) =>
  (input: TranslatableText | undefined): string | undefined => {
    if (!input) return undefined;

    // shorthand: string is treated as translation key
    if (typeof input === 'string') {
      return t?.(input);
    }

    const translated = t?.(input.message, input.params);
    return translated ?? input.fallback ?? input.message;
  };
