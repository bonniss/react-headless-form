import { type ComponentMap, defineMapping, setupForm } from 'react-headless-form'
import type { Shells } from './types'

export const FORM_ID = 'demo-form'

/**
 * `setupForm` with the demo's root. Generic over the library's field mapping,
 * so the returned `defineConfig` types each field's `props` as the props of
 * that library's component.
 */
export function setupDemo<TFields extends ComponentMap>(fields: TFields, { Root }: Pick<Shells, 'Root'>) {
  return setupForm({
    renderRoot: ({ children, onSubmit }) => (
      <Root id={FORM_ID} onSubmit={onSubmit}>
        {children}
      </Root>
    ),
    fieldMapping: defineMapping(fields),
  })
}
