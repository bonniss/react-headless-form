import type { Translator } from '../shared/i18n'
import { type Profile, logic, roleOptions, themeOptions } from '../shared/logic'
import { setupDemo } from '../shared/setup'
import { fields, shells } from './fields'

const { Section, LinesList } = shells
const [Form, defineConfig] = setupDemo(fields, shells)

/**
 * The logic comes from `shared/logic.ts` (`...logic.x`); everything in
 * `props` is Mantine's own API, typed by Mantine's component props.
 */
const buildConfig = (t: Translator) =>
  defineConfig<Profile>({
    name: { type: 'text', ...logic.name, props: { placeholder: 'Phở Bò' } },
    slug: { type: 'text', ...logic.slug, props: { description: 'hint.slug' } },
    email: { type: 'text', ...logic.email, props: { type: 'email', leftSection: '@', autoComplete: 'email' } },
    role: {
      type: 'select',
      ...logic.role,
      props: { data: roleOptions(t), searchable: true, placeholder: 'hint.search' },
    },
    adminCode: { type: 'text', ...logic.adminCode },
    bio: { type: 'longText', ...logic.bio, props: { autosize: true, minRows: 2, maxRows: 5 } },
    health: {
      type: 'section',
      ...logic.health,
      render: ({ label, children }) => <Section title={label}>{children}</Section>,
      props: {
        nested: true,
        config: {
          weight: { type: 'text', ...logic.weight, props: { type: 'number', rightSection: 'kg' } },
          height: { type: 'text', ...logic.height, props: { type: 'number', rightSection: 'cm' } },
          bmi: { type: 'text', ...logic.bmi, props: { variant: 'filled' } },
          bmiClass: { type: 'text', ...logic.bmiClass, props: { variant: 'filled' } },
        },
      },
    },
    settings: {
      type: 'section',
      ...logic.settings,
      render: ({ label, children }) => <Section title={label}>{children}</Section>,
      props: {
        nested: true,
        config: {
          newsletter: { type: 'checkbox', ...logic.newsletter, props: { color: 'teal' } },
          theme: { type: 'select', ...logic.theme, props: { data: themeOptions(t) } },
        },
      },
    },
    lines: {
      type: 'array',
      ...logic.lines,
      render: () => <LinesList />,
      props: {
        config: {
          item: { type: 'text', ...logic.item },
          qty: { type: 'text', ...logic.qty, props: { type: 'number', min: 1 } },
          price: { type: 'text', ...logic.price, props: { type: 'number', min: 0, rightSection: '₫' } },
          total: { type: 'text', ...logic.total, props: { variant: 'filled' } },
        },
      },
    },
    subtotal: { type: 'text', ...logic.subtotal, props: { variant: 'filled' } },
    vat: { type: 'text', ...logic.vat, props: { variant: 'filled' } },
    grandTotal: { type: 'text', ...logic.grandTotal, props: { variant: 'filled', fw: 700 } },
  })

export const demo = { Form, buildConfig }
