import type { ReactNode } from 'react'
import { Button, Card, Stack } from 'react-bootstrap'
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

// renderRoot: the whole form, with a title and Bootstrap's responsive grid
function Root({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) {
  const t = useT()
  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate>
      <h3 className="mb-3">{t('title')}</h3>
      <div className="row row-cols-1 row-cols-sm-2 g-3">
        {/* each field is a grid cell; sections and the guest list span the row */}
        {children}
      </div>
      <Button type="submit" className="mt-3">
        {t('action.save')}
      </Button>
    </form>
  )
}

function Guests() {
  const t = useT()
  const { label, fields, renderItem, append, remove, errorMessage } = useArrayField()
  return (
    <Card className="w-100">
      <Card.Body>
        <Card.Title as="h6">{label}</Card.Title>
        <Stack gap={2}>
          {fields.map((item, index) => (
            <div key={item.id} className="d-flex align-items-end gap-2">
              <div className="flex-grow-1">{renderItem(item, index)}</div>
              <Button variant="outline-danger" onClick={() => remove(index)}>
                {t('action.remove')}
              </Button>
            </div>
          ))}
          {errorMessage && <div className="text-danger small">{errorMessage}</div>}
          <Button variant="outline-primary" onClick={() => append({ name: '' }, { shouldFocus: false })}>
            {t('action.addGuest')}
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  )
}

export const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => <Root onSubmit={onSubmit}>{children}</Root>,
  fieldMapping: defineMapping(fields),
})

// Labels are i18n keys; `props` is React-Bootstrap's own API, typed by its components
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
      props: { placeholder: 'hint.promoCode', size: 'sm' },
    },
    guests: {
      type: 'array',
      label: 'field.guests',
      rules: { maxLength: 3 },
      render: () => (
        <div className="w-100">
          <Guests />
        </div>
      ),
      props: { config: { name: { type: 'text', label: 'field.guestName', rules: { required: true } } } },
    },
    invoice: { type: 'checkbox', label: 'field.invoice' },
    billing: {
      type: 'section',
      label: 'field.billing',
      visible: { when: 'invoice', eq: true },
      render: ({ label, children }) => (
        <div className="w-100">
          <Card>
            <Card.Body>
              <Card.Title as="h6">{label}</Card.Title>
              <div className="row row-cols-1 row-cols-sm-2 g-3">{children}</div>
            </Card.Body>
          </Card>
        </div>
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
      props: { plaintext: true, className: 'fw-bold' },
    },
  })
