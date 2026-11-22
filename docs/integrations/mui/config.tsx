import { InputAdornment, MenuItem } from '@mui/material'
import type { Translator } from '../shared/i18n'
import { type Profile, logic, roleOptions, themeOptions } from '../shared/logic'
import { setupDemo } from '../shared/setup'
import { fields, shells } from './fields'

const { Section, LinesList } = shells
const [Form, defineConfig] = setupDemo(fields, shells)

/**
 * The logic comes from `shared/logic.ts` (`...logic.x`); everything in
 * `props` is Material UI's own API, typed by Material UI's component props.
 */
const buildConfig = (t: Translator) =>
  defineConfig<Profile>({
    name: { type: 'text', ...logic.name, props: { placeholder: 'Phở Bò' } },
    slug: { type: 'text', ...logic.slug, props: { helperText: t('hint.slug') } },
    email: { type: 'text', ...logic.email, props: { type: 'email', autoComplete: 'email', slotProps: { input: { startAdornment: <InputAdornment position="start">@</InputAdornment> } } } },
    role: { type: 'select', ...logic.role, props: { children: roleOptions(t).map(o => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        )) } },
    adminCode: { type: 'text', ...logic.adminCode },
    bio: { type: 'longText', ...logic.bio, props: { minRows: 2, maxRows: 5 } },
    health: {
      type: 'section',
      ...logic.health,
      render: ({ label, children }) => <Section title={label}>{children}</Section>,
      props: {
        nested: true,
        config: {
          weight: { type: 'text', ...logic.weight, props: { type: 'number', slotProps: { input: { endAdornment: <InputAdornment position="end">kg</InputAdornment> } } } },
          height: { type: 'text', ...logic.height, props: { type: 'number', slotProps: { input: { endAdornment: <InputAdornment position="end">cm</InputAdornment> } } } },
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
          newsletter: { type: 'checkbox', ...logic.newsletter, props: { color: 'secondary' } },
          theme: { type: 'select', ...logic.theme, props: { children: themeOptions(t).map(o => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
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
          qty: { type: 'text', ...logic.qty, props: { type: 'number' } },
          price: { type: 'text', ...logic.price, props: { type: 'number', slotProps: { input: { endAdornment: <InputAdornment position="end">₫</InputAdornment> } } } },
          total: { type: 'text', ...logic.total, props: { variant: 'filled' } },
        },
      },
    },
    subtotal: { type: 'text', ...logic.subtotal, props: { variant: 'filled' } },
    vat: { type: 'text', ...logic.vat, props: { variant: 'filled' } },
    grandTotal: { type: 'text', ...logic.grandTotal, props: { variant: 'filled', slotProps: { htmlInput: { style: { fontWeight: 700 } } } } },
  })

export const demo = { Form, buildConfig }
