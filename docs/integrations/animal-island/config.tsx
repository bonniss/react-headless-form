import type { Translator } from '../shared/i18n'
import { type Profile, logic, roleOptions, themeOptions } from '../shared/logic'
import { setupDemo } from '../shared/setup'
import { fields, shells } from './fields'

const { Section, LinesList } = shells
const [Form, defineConfig] = setupDemo(fields, shells)

/**
 * The logic comes from `shared/logic.ts` (`...logic.x`); everything in
 * `props` is animal-island-ui's own API, typed by animal-island-ui's component props.
 */
const buildConfig = (t: Translator) =>
  defineConfig<Profile>({
    name: { type: 'text', ...logic.name, props: { placeholder: 'Phở Bò', allowClear: true } },
    slug: { type: 'text', ...logic.slug, props: { placeholder: t('hint.slug') } },
    email: { type: 'text', ...logic.email, props: { type: 'email', prefix: '@', autoComplete: 'email' } },
    role: { type: 'select', ...logic.role, props: { options: roleOptions(t).map(o => ({ key: o.value, label: o.label })), showSearch: true } },
    adminCode: { type: 'text', ...logic.adminCode },
    bio: { type: 'longText', ...logic.bio, props: { placeholder: '…' } },
    health: {
      type: 'section',
      ...logic.health,
      render: ({ label, children }) => <Section title={label}>{children}</Section>,
      props: {
        nested: true,
        config: {
          weight: { type: 'text', ...logic.weight, props: { type: 'number', suffix: 'kg' } },
          height: { type: 'text', ...logic.height, props: { type: 'number', suffix: 'cm' } },
          bmi: { type: 'text', ...logic.bmi, props: { shadow: false } },
          bmiClass: { type: 'text', ...logic.bmiClass, props: { shadow: false } },
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
          newsletter: { type: 'checkbox', ...logic.newsletter, props: { size: 'small' } },
          theme: { type: 'select', ...logic.theme, props: { options: themeOptions(t).map(o => ({ key: o.value, label: o.label })), variant: 'game' } },
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
          price: { type: 'text', ...logic.price, props: { type: 'number', min: 0, suffix: '₫' } },
          total: { type: 'text', ...logic.total, props: { shadow: false } },
        },
      },
    },
    subtotal: { type: 'text', ...logic.subtotal, props: { shadow: false } },
    vat: { type: 'text', ...logic.vat, props: { shadow: false } },
    grandTotal: { type: 'text', ...logic.grandTotal, props: { shadow: true } },
  })

export const demo = { Form, buildConfig }
