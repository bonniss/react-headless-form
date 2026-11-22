import type { ComponentType, FormEvent, ReactNode } from 'react'

/** The props every library's field adapters accept, so the shared config type-checks the same way for all of them. */
export type TextFieldProps = { type?: 'text' | 'email' | 'password'; placeholder?: string }
export type LongTextFieldProps = { rows?: number }
export type SelectFieldProps = { options: { value: string; label: string }[] }
export type CheckboxFieldProps = Record<string, never>

/** Field components, keyed by field `type`. */
export type Fields = {
  text: ComponentType<TextFieldProps>
  longText: ComponentType<LongTextFieldProps>
  select: ComponentType<SelectFieldProps>
  checkbox: ComponentType<CheckboxFieldProps>
}

/** Layout pieces: the form root, a section card, the address list and the language toggle button. */
export type Shells = {
  LanguageButton: ComponentType<{ active: boolean; onClick: () => void; children: ReactNode }>
  Root: ComponentType<{ children: ReactNode; onSubmit: (e?: FormEvent) => void }>
  Section: ComponentType<{ title: ReactNode; children: ReactNode }>
  AddressList: ComponentType
}
