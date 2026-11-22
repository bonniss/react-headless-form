import type { ComponentType, FormEvent, ReactNode } from 'react'

/** The props every library's field adapters accept, so the shared config type-checks the same way for all of them. */
export type TextFieldProps = { type?: 'text' | 'email' | 'password' | 'number'; placeholder?: string }
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

export type LanguageOption = { value: string; label: string }

/**
 * The UI pieces a library provides around the fields. Everything here is
 * presentation only: no form logic lives in a library's adapters.
 */
export type Shells = {
  /** The `<form>`; `id` lets buttons outside it submit it (`form={id}`). */
  Root: ComponentType<{ id: string; children: ReactNode; onSubmit: (e?: FormEvent) => void }>
  /** A submit button bound to the form by id (used in the header). */
  SubmitButton: ComponentType<{ form: string; children: ReactNode }>
  /** Render prop for the language toggle, with the library's own control. */
  LanguageSwitch: ComponentType<{ value: string; options: LanguageOption[]; onChange: (value: string) => void }>
  /** A titled group (nested section). */
  Section: ComponentType<{ title: ReactNode; children: ReactNode }>
  /** The invoice lines array: rows, add / remove and the array-level error. */
  LinesList: ComponentType
}
