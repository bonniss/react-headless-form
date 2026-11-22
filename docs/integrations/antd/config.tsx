import type { Translator } from '../shared/i18n'
import { type Profile, logic, roleOptions, themeOptions } from '../shared/logic'
import { setupDemo } from '../shared/setup'
import { fields, shells } from './fields'

const { Section, LinesList } = shells
const [Form, defineConfig] = setupDemo(fields, shells)

/**
 * The logic comes from `shared/logic.ts` (`...logic.x`); everything in
 * `props` is Ant Design's own API, typed by Ant Design's component props.
 */
const buildConfig = (t: Translator) =>
  defineConfig<Profile>({
    name: { type: 'text', ...logic.name, props: { placeholder: 'Phở Bò', allowClear: true } },
    slug: { type: 'text', ...logic.slug, props: { placeholder: 'hint.slug' } },
    email: { type: 'text', ...logic.email, props: { type: 'email', prefix: '@', autoComplete: 'email' } },
    role: { type: 'select', ...logic.role, props: { options: roleOptions(t), showSearch: true, optionFilterProp: 'label' } },
    adminCode: { type: 'text', ...logic.adminCode },
    bio: { type: 'longText', ...logic.bio, props: { showCount: true, maxLength: 160, autoSize: { minRows: 2, maxRows: 5 }, style: { marginBottom: 16 } } },
    health: {
      type: 'section',
      ...logic.health,
      render: ({ label, children }) => <Section title={label}>{children}</Section>,
      props: {
        nested: true,
        config: {
          weight: { type: 'text', ...logic.weight, props: { type: 'number', suffix: 'kg' } },
          height: { type: 'text', ...logic.height, props: { type: 'number', suffix: 'cm' } },
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
          newsletter: { type: 'checkbox', ...logic.newsletter },
          theme: { type: 'select', ...logic.theme, props: { options: themeOptions(t) } },
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
          total: { type: 'text', ...logic.total, props: { variant: 'filled' } },
        },
      },
    },
    subtotal: { type: 'text', ...logic.subtotal, props: { variant: 'filled' } },
    vat: { type: 'text', ...logic.vat, props: { variant: 'filled' } },
    grandTotal: { type: 'text', ...logic.grandTotal, props: { variant: 'filled', style: { fontWeight: 700 } } },
  })

export const demo = { Form, buildConfig }
