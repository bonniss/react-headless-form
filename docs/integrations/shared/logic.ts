import type { ComputeFn, Condition, ValidationRules } from 'react-headless-form'
import type { Translator } from './i18n'
import { slugify } from './slugify'

/*
 * All form logic of the demo: model, labels, rules, conditions and computed
 * values. Each library's `config.tsx` spreads these pieces into its own config
 * and only adds `type` and the library's native `props`.
 */

export type Line = { item: string; qty: string; price: string; total?: number }
export type Health = { weight: string; height: string; bmi?: number; bmiClass?: string }

export type Profile = {
  name: string
  slug: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  adminCode?: string
  bio?: string
  health: Health
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

/** The logic part of one field config: everything except `type` and `props`. */
type Logic<TModel extends object, TValue = unknown> = {
  label: string
  rules?: ValidationRules
  visible?: Condition<TModel>
  disabled?: Condition<TModel>
  readOnly?: boolean
  compute?: ComputeFn<TModel, Profile, TValue>
}

export const logic = {
  // required + translated message
  name: { label: 'field.name', rules: { required: true } } satisfies Logic<Profile>,
  // computed, editable: follows the name until the user edits it
  slug: { label: 'field.slug', compute: v => slugify(v.name ?? '') } satisfies Logic<Profile, string>,
  // pattern rule
  email: { label: 'field.email', rules: { pattern: '^\\S+@\\S+\\.\\S+$' } } satisfies Logic<Profile>,
  role: { label: 'field.role' } satisfies Logic<Profile>,
  // JSON condition `visible`: admins only, and left out of the payload when hidden
  adminCode: {
    label: 'field.adminCode',
    visible: { when: 'role', eq: 'admin' },
    rules: { required: true },
  } satisfies Logic<Profile>,
  // JSON condition `disabled`: viewers cannot edit their bio
  bio: { label: 'field.bio', disabled: { when: 'role', eq: 'viewer' } } satisfies Logic<Profile>,

  // nested section: computes read their own section through ctx.scope
  health: { label: 'field.health' },
  weight: { label: 'field.weight' } satisfies Logic<Health>,
  height: { label: 'field.height' } satisfies Logic<Health>,
  bmi: {
    label: 'field.bmi',
    readOnly: true,
    compute: (_, { scope }) => {
      const w = num(scope?.weight)
      const h = num(scope?.height)
      return w && h ? Math.round((w / (h / 100) ** 2) * 10) / 10 : undefined
    },
  } satisfies Logic<Health, number>,
  // computed from a computed field; a language-neutral code, as data should be
  bmiClass: {
    label: 'field.bmiClass',
    readOnly: true,
    compute: (_, { scope }) => {
      const bmi = num(scope?.bmi)
      if (bmi === undefined) return undefined
      return bmi < 18.5 ? 'underweight' : bmi < 23 ? 'normal' : bmi < 25 ? 'overweight' : 'obese'
    },
  } satisfies Logic<Health, string>,

  settings: { label: 'field.settings' },
  newsletter: { label: 'field.newsletter' },
  theme: { label: 'field.theme' },

  // array: at most MAX_LINES rows; each row's fields are required (errors land
  // on the exact row) and its total is computed from the row
  lines: { label: 'field.lines', rules: { maxLength: MAX_LINES } } satisfies Logic<Profile>,
  item: { label: 'field.item', rules: { required: true } } satisfies Logic<Line>,
  qty: { label: 'field.qty', rules: { required: true } } satisfies Logic<Line>,
  price: { label: 'field.price', rules: { required: true } } satisfies Logic<Line>,
  total: {
    label: 'field.total',
    readOnly: true,
    compute: (_, { scope }) => (num(scope?.qty) ?? 0) * (num(scope?.price) ?? 0),
  } satisfies Logic<Line, number>,

  // aggregates: computed from the computed row totals, chained
  subtotal: {
    label: 'field.subtotal',
    readOnly: true,
    compute: v => (v.lines ?? []).reduce((sum, line) => sum + (line?.total ?? 0), 0),
  } satisfies Logic<Profile, number>,
  vat: { label: 'field.vat', readOnly: true, compute: v => Math.round((v.subtotal ?? 0) * 0.1) } satisfies Logic<
    Profile,
    number
  >,
  grandTotal: {
    label: 'field.grandTotal',
    readOnly: true,
    compute: v => (v.subtotal ?? 0) + (v.vat ?? 0),
  } satisfies Logic<Profile, number>,
}

/** Option values are part of the model; each library maps them to its own option shape. */
export const roleOptions = (t: Translator) =>
  (['viewer', 'editor', 'admin'] as const).map(value => ({ value, label: t(`role.${value}`) }))

export const themeOptions = (t: Translator) =>
  (['light', 'dark'] as const).map(value => ({ value, label: t(`theme.${value}`) }))
