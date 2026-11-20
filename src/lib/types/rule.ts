import type { Message, RegisterOptions } from 'react-hook-form'

/**
 * `pattern` also accepts a string so configs can be pure data (e.g. loaded
 * from a database). Strings are converted with `new RegExp(source)`; the
 * `/source/flags` form is supported too.
 */
export type PatternRule =
  | RegisterOptions['pattern']
  | string
  | { value: string; message: Message }

export type ValidationRules = Pick<
  RegisterOptions,
  'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'validate'
> & {
  pattern?: PatternRule
}

export type ValidationType = keyof ValidationRules
