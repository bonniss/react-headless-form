import type { ComponentType, ReactNode } from 'react'
import type { Translator } from './i18n'

export type LanguageOption = { value: string; label: string }

/** What a library's demo exports from its `form.tsx`. */
export type DemoForm = {
  // biome-ignore lint/suspicious/noExplicitAny: each library's Form has its own config type
  Form: ComponentType<any>
  buildConfig: (t: Translator) => unknown
  defaultValues: object
}

/** The demo stage's controls, drawn with the library's own components. */
export type Shells = {
  /**
   * The header's submit button. DOM libraries bind it to the form with
   * `form={form}`; React Native (no <form>) calls `onSubmit` instead.
   */
  SubmitButton: ComponentType<{ form: string; onSubmit: () => void; children: ReactNode }>
  /** Render prop for the language toggle, with the library's own control. */
  LanguageSwitch: ComponentType<{ value: string; options: LanguageOption[]; onChange: (value: string) => void }>
}
