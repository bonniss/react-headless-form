import type { Translator } from '../shared/i18n'
import { type Profile, logic, roleOptions, themeOptions } from '../shared/logic'
import { setupDemo } from '../shared/setup'
import { fields, shells } from './fields'

const { Section, LinesList } = shells
const [Form, defineConfig] = setupDemo(fields, shells)

/**
 * The logic comes from `shared/logic.ts` (`...logic.x`); everything in
 * `props` is shadcn/ui's own API, typed by shadcn/ui's component props.
 */
const buildConfig = (t: Translator) =>
  defineConfig<Profile>({
    name: { type: 'text', ...logic.name, props: { placeholder: 'Phở Bò' } },
    slug: { type: 'text', ...logic.slug, props: { placeholder: 'hint.slug' } },
    email: { type: 'text', ...logic.email, props: { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' } },
    role: { type: 'select', ...logic.role, props: { children: roleOptions(t).map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        )) } },
    adminCode: { type: 'text', ...logic.adminCode },
    bio: { type: 'longText', ...logic.bio, props: { rows: 2, className: 'resize-none' } },
    health: {
      type: 'section',
      ...logic.health,
      render: ({ label, children }) => <Section title={label}>{children}</Section>,
      props: {
        nested: true,
        config: {
          weight: { type: 'text', ...logic.weight, props: { type: 'number', inputMode: 'decimal', placeholder: 'kg' } },
          height: { type: 'text', ...logic.height, props: { type: 'number', inputMode: 'decimal', placeholder: 'cm' } },
          bmi: { type: 'text', ...logic.bmi, props: { className: 'bg-zinc-50 font-mono' } },
          bmiClass: { type: 'text', ...logic.bmiClass, props: { className: 'bg-zinc-50 font-mono' } },
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
          newsletter: { type: 'checkbox', ...logic.newsletter, props: { className: 'accent-emerald-600' } },
          theme: { type: 'select', ...logic.theme, props: { children: themeOptions(t).map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              )) } },
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
          price: { type: 'text', ...logic.price, props: { type: 'number', min: 0, step: 1000 } },
          total: { type: 'text', ...logic.total, props: { className: 'bg-zinc-50 font-mono' } },
        },
      },
    },
    subtotal: { type: 'text', ...logic.subtotal, props: { className: 'bg-zinc-50 font-mono' } },
    vat: { type: 'text', ...logic.vat, props: { className: 'bg-zinc-50 font-mono' } },
    grandTotal: { type: 'text', ...logic.grandTotal, props: { className: 'bg-zinc-50 font-mono font-bold' } },
  })

export const demo = { Form, buildConfig }
