import type { ValidationRules, ValidationType } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TranslateFn = (...args: any[]) => string | undefined;

export type TranslatableText =
  | string
  | {
      message: string;
      params?: Record<string, string | number | undefined>;
      fallback?: string;
    };

export type TranslationResolver = (
  translateKey: TranslatableText | undefined
) => string | undefined | null;

export type ValidationTranslationMap = Partial<Record<ValidationType, string>>;

export type ValidationResolver = Partial<{
  [key in ValidationType]: (args: {
    field: string;
    rule: ValidationRules[key];
  }) => ValidationRules[key];
}>;
