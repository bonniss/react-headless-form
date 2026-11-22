import { defineMapping, setupForm } from 'react-headless-form'
import type { createTranslator } from './i18n'
import { slugify } from './slugify'
import type { Fields, Shells } from './types'

export type Profile = {
  name: string
  slug: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  adminCode?: string
  bio?: string
  settings: { newsletter: boolean; theme: 'light' | 'dark' }
  addresses: { street: string; city: string }[]
  addressCount: number
}

export const defaultValues: Partial<Profile> = {
  role: 'viewer',
  settings: { newsletter: true, theme: 'light' },
  addresses: [{ street: '', city: '' }],
}

/**
 * The same form for every UI library: only `fields` and `shells` change.
 * It shows rules, JSON conditions (visible / disabled), computed fields, a
 * nested section, an array field and i18n.
 */
export function createDemoForm(fields: Fields, { Root, Section, AddressList }: Shells) {
  const [Form, defineConfig] = setupForm({
    renderRoot: ({ children, onSubmit }) => <Root onSubmit={onSubmit}>{children}</Root>,
    fieldMapping: defineMapping(fields),
  })

  /**
   * Labels are translation keys, resolved by the form's i18nConfig.t. Option
   * labels live inside `props`, so they are translated here with the same t.
   */
  const buildConfig = (t: ReturnType<typeof createTranslator>) =>
    defineConfig<Profile>({
      name: { type: 'text', label: 'field.name', rules: { required: true } },
      // computed, editable: follows the name until the user edits it
      slug: { type: 'text', label: 'field.slug', compute: v => slugify(v.name ?? '') },
      email: {
        type: 'text',
        label: 'field.email',
        props: { type: 'email' },
        rules: { pattern: '^\\S+@\\S+\\.\\S+$' },
      },
      role: {
        type: 'select',
        label: 'field.role',
        props: {
          options: [
            { value: 'viewer', label: t('role.viewer') },
            { value: 'editor', label: t('role.editor') },
            { value: 'admin', label: t('role.admin') },
          ],
        },
      },
      // JSON condition: shown only to admins (and dropped from the payload otherwise)
      adminCode: {
        type: 'text',
        label: 'field.adminCode',
        visible: { when: 'role', eq: 'admin' },
        rules: { required: true },
      },
      // JSON condition: viewers cannot edit their bio
      bio: {
        type: 'longText',
        label: 'field.bio',
        disabled: { when: 'role', eq: 'viewer' },
        props: { rows: 3 },
      },
      settings: {
        type: 'section',
        label: 'field.settings',
        render: ({ label, children }) => <Section title={label}>{children}</Section>,
        props: {
          nested: true,
          config: {
            newsletter: { type: 'checkbox', label: 'field.newsletter' },
            theme: {
              type: 'select',
              label: 'field.theme',
              props: {
                options: [
                  { value: 'light', label: t('theme.light') },
                  { value: 'dark', label: t('theme.dark') },
                ],
              },
            },
          },
        },
      },
      addresses: {
        type: 'array',
        label: 'field.addresses',
        render: () => <AddressList />,
        props: {
          config: {
            street: { type: 'text', label: 'field.street' },
            city: { type: 'text', label: 'field.city' },
          },
        },
      },
      // computed, read-only: an aggregate of the array
      addressCount: {
        type: 'text',
        label: 'field.addressCount',
        readOnly: true,
        compute: v => v.addresses?.length ?? 0,
      },
    })

  return { Form, buildConfig }
}
