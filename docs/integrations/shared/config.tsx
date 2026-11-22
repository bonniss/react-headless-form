import { defineMapping, setupForm } from 'react-headless-form'
import type { Translator } from './i18n'
import { slugify } from './slugify'
import type { Fields, Shells } from './types'

type Line = { item: string; qty: string; price: string; total?: number }

export type Profile = {
  name: string
  slug: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  adminCode?: string
  bio?: string
  health: { weight: string; height: string; bmi?: number; bmiClass?: string }
  settings: { newsletter: boolean; theme: 'light' | 'dark' }
  lines: Line[]
  subtotal?: number
  vat?: number
  grandTotal?: number
}

export const defaultValues: Partial<Profile> = {
  role: 'viewer',
  health: { weight: '', height: '' },
  settings: { newsletter: true, theme: 'light' },
  lines: [{ item: 'Coffee', qty: '2', price: '35000' }],
}

/** Paths of computed fields, highlighted in the submitted payload. */
export const computedPaths = ['slug', 'health.bmi', 'health.bmiClass', 'lines.*.total', 'subtotal', 'vat', 'grandTotal']

export const MAX_LINES = 3

const num = (value: unknown) => (value === '' || value == null ? undefined : Number(value))

/**
 * The same form for every UI library: only `fields` and `shells` change.
 * Every rule, condition and computed value below is shared logic.
 */
export function createDemoForm(fields: Fields, { Root, Section, LinesList }: Shells) {
  const [Form, defineConfig] = setupForm({
    renderRoot: ({ children, onSubmit }) => (
      <Root id="demo-form" onSubmit={onSubmit}>
        {children}
      </Root>
    ),
    fieldMapping: defineMapping(fields),
  })

  // Labels are translation keys resolved by i18nConfig.t; option labels live
  // in `props`, so they are translated here with the same t.
  const buildConfig = (t: Translator) =>
    defineConfig<Profile>({
      // required + translated message
      name: { type: 'text', label: 'field.name', rules: { required: true } },
      // computed, editable: follows the name until the user edits it
      slug: { type: 'text', label: 'field.slug', compute: v => slugify(v.name ?? '') },
      // pattern rule
      email: { type: 'text', label: 'field.email', props: { type: 'email' }, rules: { pattern: '^\\S+@\\S+\\.\\S+$' } },
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
      // JSON condition `visible`: admins only, and left out of the payload when hidden
      adminCode: {
        type: 'text',
        label: 'field.adminCode',
        visible: { when: 'role', eq: 'admin' },
        rules: { required: true },
      },
      // JSON condition `disabled`: viewers cannot edit their bio
      bio: { type: 'longText', label: 'field.bio', disabled: { when: 'role', eq: 'viewer' }, props: { rows: 2 } },
      // nested section: computes read their own section through ctx.scope
      health: {
        type: 'section',
        label: 'field.health',
        render: ({ label, children }) => <Section title={label}>{children}</Section>,
        props: {
          nested: true,
          config: {
            weight: { type: 'text', label: 'field.weight', props: { type: 'number' } },
            height: { type: 'text', label: 'field.height', props: { type: 'number' } },
            bmi: {
              type: 'text',
              label: 'field.bmi',
              readOnly: true,
              compute: (_, { scope }) => {
                const w = num(scope?.weight)
                const h = num(scope?.height)
                return w && h ? Math.round((w / (h / 100) ** 2) * 10) / 10 : undefined
              },
            },
            // computed from a computed field; a language-neutral code, as data should be
            bmiClass: {
              type: 'text',
              label: 'field.bmiClass',
              readOnly: true,
              compute: (_, { scope }) => {
                const bmi = num(scope?.bmi)
                if (bmi === undefined) return undefined
                return bmi < 18.5 ? 'underweight' : bmi < 23 ? 'normal' : bmi < 25 ? 'overweight' : 'obese'
              },
            },
          },
        },
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
      // array: at most MAX_LINES rows; each row's fields are required (errors
      // land on the exact row) and its total is computed from the row
      lines: {
        type: 'array',
        label: 'field.lines',
        rules: { maxLength: MAX_LINES },
        render: () => <LinesList />,
        props: {
          config: {
            item: { type: 'text', label: 'field.item', rules: { required: true } },
            qty: { type: 'text', label: 'field.qty', props: { type: 'number' }, rules: { required: true } },
            price: { type: 'text', label: 'field.price', props: { type: 'number' }, rules: { required: true } },
            total: {
              type: 'text',
              label: 'field.total',
              readOnly: true,
              compute: (_, { scope }) => (num(scope?.qty) ?? 0) * (num(scope?.price) ?? 0),
            },
          },
        },
      },
      // aggregates: computed from computed row totals, chained
      subtotal: {
        type: 'text',
        label: 'field.subtotal',
        readOnly: true,
        compute: v => (v.lines ?? []).reduce((sum, line) => sum + (line.total ?? 0), 0),
      },
      vat: { type: 'text', label: 'field.vat', readOnly: true, compute: v => Math.round((v.subtotal ?? 0) * 0.1) },
      grandTotal: {
        type: 'text',
        label: 'field.grandTotal',
        readOnly: true,
        compute: v => (v.subtotal ?? 0) + (v.vat ?? 0),
      },
    })

  return { Form, buildConfig }
}
