import type { ValidationRules, ValidationType } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TranslateFn = (...args: any[]) => string | undefined;

/**
 * Type registry for module augmentation.
 *
 * Register your app's i18n key union to get type-checked `label` / `description`:
 *
 * ```ts
 * declare module 'react-headless-form' {
 *   interface Register {
 *     i18nKey: MyI18nKey;
 *   }
 * }
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: augmented by consumers
export interface Register {}

/** The registered i18n key union, or `string` when none is registered. */
export type I18nKey = Register extends { i18nKey: infer K extends string }
  ? K
  : string;

/**
 * Text that goes through `i18nConfig.t`:
 * - `'key'` — shorthand translation key
 * - `{ message, params?, fallback? }` — key with interpolation params
 * - `{ text }` — literal text, shown as-is and never passed to `t`
 *   (e.g. labels loaded from a database)
 */
export type TranslatableText<TKey extends string = I18nKey> =
  | TKey
  | {
      message: TKey;
      params?: Record<string, string | number | undefined>;
      fallback?: string;
    }
  | { text: string };

export type TranslationResolver = (
  translateKey: TranslatableText<string> | undefined
) => string | undefined;

export type ValidationTranslationMap = Partial<Record<ValidationType, string>>;

export type ValidationResolver = Partial<{
  [key in ValidationType]: (args: {
    field: string;
    rule: ValidationRules[key];
  }) => ValidationRules[key];
}>;
