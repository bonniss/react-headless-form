import { TranslatableText, TranslateFn } from '.'

/**
 * A factory function to create a translator function, given a translation function.
 *
 * @param {TranslateFn} t - a translation function
 * @returns {TranslationResolver} - a translator function that can handle translation keys
 * @public
 */
export const translatorFactory = (t: TranslateFn) => (translateKey: TranslatableText | undefined) => {
  if (!translateKey) return undefined
  if (typeof translateKey === 'string') return t?.(translateKey)
  if (translateKey.enableTranslation === false) return translateKey.message
  return t?.(translateKey.message, translateKey.params) || translateKey.fallback || translateKey.message
}
