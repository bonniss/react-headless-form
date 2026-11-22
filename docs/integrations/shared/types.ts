import type { ComponentType, FormEvent, ReactNode } from 'react'
import type { Translator } from './i18n'
import type { Profile } from './logic'

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

/**
 * What a library's demo provides: its form (from `setupDemo`) and a config
 * builder typed by its own components. Typed loosely here: the strict typing
 * happens in each library's `config.tsx`.
 */
export type DemoForm = {
  // biome-ignore lint/suspicious/noExplicitAny: each library's Form has its own config type
  Form: ComponentType<any>
  buildConfig: (t: Translator) => unknown
}
export type { Profile }
