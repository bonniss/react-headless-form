import { describe, it, expect, vi } from 'vitest';
import type { TranslatableText } from '@/components/i18n';
import { normalizeTranslator } from '@/components/i18n/resolver';

describe('normalizeTranslator', () => {
  it('returns undefined when translateKey is undefined', () => {
    const t = vi.fn();
    const translator = normalizeTranslator(t);

    expect(translator(undefined)).toBeUndefined();
    expect(t).not.toHaveBeenCalled();
  });

  it('translates plain string using t', () => {
    const t = vi.fn((key: string) => `t:${key}`);
    const translator = normalizeTranslator(t);

    expect(translator('hello')).toBe('t:hello');
    expect(t).toHaveBeenCalledWith('hello');
  });

  it('passes params to translation function', () => {
    const t = vi.fn((key: string, params?: any) => `${key}:${params?.count}`);
    const translator = normalizeTranslator(t);

    const key: TranslatableText = {
      message: 'items.count',
      params: { count: 3 },
    };

    expect(translator(key)).toBe('items.count:3');
    expect(t).toHaveBeenCalledWith('items.count', { count: 3 });
  });

  it('falls back to fallback when translation returns undefined', () => {
    const t = vi.fn(() => undefined);
    const translator = normalizeTranslator(t);

    const key: TranslatableText = {
      message: 'missing.key',
      fallback: 'Fallback text',
    };

    expect(translator(key)).toBe('Fallback text');
  });

  it('falls back to message when both translation and fallback are missing', () => {
    const t = vi.fn(() => undefined);
    const translator = normalizeTranslator(t);

    const key: TranslatableText = {
      message: 'Original message',
    };

    expect(translator(key)).toBe('Original message');
  });
});
