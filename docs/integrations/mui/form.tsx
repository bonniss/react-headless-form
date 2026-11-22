import { Box, Button, Card, CardContent, MenuItem, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { defineMapping, setupForm, useArrayField } from 'react-headless-form'
import { type Translator, useT } from '../shared/i18n'
import { FORM_ID } from '../shared/mount'
import { fields } from './fields'

export type Registration = {
  name: string
  email: string
  ticket: 'standard' | 'student'
  studentId?: string
  promoCode?: string
  guests: { name: string }[]
  invoice: boolean
  billing?: { company: string; taxId?: string }
  total?: number
}

export const defaultValues: Partial<Registration> = { ticket: 'standard', guests: [], invoice: false }

const PRICE = { standard: 100, student: 50, guest: 100 }

/** Two columns from `sm` up; sections and the guest list take a full row. */
const grid = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }
const fullRow = { gridColumn: '1 / -1' }

// renderRoot: the whole form, with a title and a responsive grid
function Root({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) {
  const t = useT()
  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate>
      <Typography variant="h5" mb={2}>
        {t('title')}
      </Typography>
      <Box sx={grid}>{children}</Box>
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        {t('action.save')}
      </Button>
    </form>
  )
}

function Guests() {
  const t = useT()
  const { label, fields, renderItem, append, remove, errorMessage } = useArrayField()
  return (
    <Card variant="outlined" sx={fullRow}>
      <CardContent>
        <Typography variant="subtitle1" mb={1}>
          {label}
        </Typography>
        <Stack spacing={1.5}>
          {fields.map((item, index) => (
            <Stack key={item.id} direction="row" spacing={1} alignItems="start">
              {renderItem(item, index)}
              <Button color="error" onClick={() => remove(index)}>
                {t('action.remove')}
              </Button>
            </Stack>
          ))}
          {errorMessage && (
            <Typography color="error" variant="body2">
              {errorMessage}
            </Typography>
          )}
          <Button variant="outlined" onClick={() => append({ name: '' }, { shouldFocus: false })}>
            {t('action.addGuest')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

export const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => <Root onSubmit={onSubmit}>{children}</Root>,
  fieldMapping: defineMapping(fields),
})

// Labels are i18n keys; `props` is Material UI's own API (TextFieldProps, ...)
export const buildConfig = (t: Translator) =>
  defineConfig<Registration>({
    name: { type: 'text', label: 'field.name', rules: { required: true } },
    email: {
      type: 'text',
      label: 'field.email',
      rules: { required: true, pattern: '^\\S+@\\S+\\.\\S+$' },
      props: { type: 'email', placeholder: 'hint.email' },
    },
    ticket: {
      type: 'select',
      label: 'field.ticket',
      props: {
        children: [
          <MenuItem key="standard" value="standard">
            {t('ticket.standard')}
          </MenuItem>,
          <MenuItem key="student" value="student">
            {t('ticket.student')}
          </MenuItem>,
        ],
      },
    },
    studentId: {
      type: 'text',
      label: 'field.studentId',
      visible: { when: 'ticket', eq: 'student' },
      rules: { required: true },
    },
    promoCode: {
      type: 'text',
      label: 'field.promoCode',
      disabled: { when: 'ticket', eq: 'student' },
      props: { helperText: 'hint.promoCode' },
    },
    guests: {
      type: 'array',
      label: 'field.guests',
      rules: { maxLength: 3 },
      render: () => <Guests />,
      props: { config: { name: { type: 'text', label: 'field.guestName', rules: { required: true } } } },
    },
    invoice: { type: 'checkbox', label: 'field.invoice' },
    billing: {
      type: 'section',
      label: 'field.billing',
      visible: { when: 'invoice', eq: true },
      render: ({ label, children }) => (
        <Card variant="outlined" sx={fullRow}>
          <CardContent>
            <Typography variant="subtitle1" mb={1}>
              {label}
            </Typography>
            <Box sx={grid}>{children}</Box>
          </CardContent>
        </Card>
      ),
      props: {
        nested: true,
        config: {
          company: { type: 'text', label: 'field.company', rules: { required: true } },
          taxId: { type: 'text', label: 'field.taxId' },
        },
      },
    },
    total: {
      type: 'text',
      label: 'field.total',
      readOnly: true,
      compute: v => PRICE[v.ticket ?? 'standard'] + PRICE.guest * (v.guests?.length ?? 0),
      props: { variant: 'filled' },
    },
  })
