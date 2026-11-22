import type { ReactNode } from 'react'
import { defineMapping, setupForm, useArrayField } from 'react-headless-form'
import { type Translator, useT } from '../shared/i18n'
import { FORM_ID } from '../shared/mount'
import { fields } from './fields'
import { Button, Card, CardTitle } from './ui'

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

// renderRoot: the whole form, with a title and a responsive grid
function Root({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) {
  const t = useT()
  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className="grid gap-4">
      <h2 className="text-xl font-semibold">{t('title')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
      <Button type="submit" className="justify-self-start">
        {t('action.save')}
      </Button>
    </form>
  )
}

function Guests() {
  const t = useT()
  const { label, fields, renderItem, append, remove, errorMessage } = useArrayField()
  return (
    <Card className="sm:col-span-2">
      <CardTitle>{label}</CardTitle>
      {fields.map((item, index) => (
        <div key={item.id} className="flex items-end gap-2">
          <div className="flex-1">{renderItem(item, index)}</div>
          <Button type="button" variant="ghost" onClick={() => remove(index)}>
            {t('action.remove')}
          </Button>
        </div>
      ))}
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <Button type="button" variant="outline" onClick={() => append({ name: '' }, { shouldFocus: false })}>
        {t('action.addGuest')}
      </Button>
    </Card>
  )
}

export const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => <Root onSubmit={onSubmit}>{children}</Root>,
  fieldMapping: defineMapping(fields),
})

// Labels are i18n keys; `props` are the shadcn components' own props
export const buildConfig = (t: Translator) =>
  defineConfig<Registration>({
    name: { type: 'text', label: 'field.name', rules: { required: true } },
    email: {
      type: 'text',
      label: 'field.email',
      rules: { required: true, pattern: '^\\S+@\\S+\\.\\S+$' },
      props: { type: 'email', placeholder: 'hint.email', autoComplete: 'email' },
    },
    ticket: {
      type: 'select',
      label: 'field.ticket',
      props: {
        children: [
          <option key="standard" value="standard">
            {t('ticket.standard')}
          </option>,
          <option key="student" value="student">
            {t('ticket.student')}
          </option>,
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
      props: { placeholder: 'hint.promoCode', className: 'uppercase' },
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
        <Card className="sm:col-span-2">
          <CardTitle>{label}</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">{children}</div>
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
      props: { className: 'bg-zinc-50 font-mono font-bold' },
    },
  })
