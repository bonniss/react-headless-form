import { RegisterOptions } from 'react-hook-form'

export type ValidationRules = Pick<
  RegisterOptions,
  'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'validate'
>

export type ValidationType = keyof ValidationRules
