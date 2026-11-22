import { Button, Card, Flex, Typography } from 'antd'
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

/** Two columns on wide screens; sections and the guest list take a full row. */
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', columnGap: 16 }
const fullRow = { gridColumn: '1 / -1', marginBottom: 16 }

// renderRoot: the whole form, with a title and a responsive grid
function Root({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) {
  const t = useT()
  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate>
      <Typography.Title level={3}>{t('title')}</Typography.Title>
      <div style={grid}>{children}</div>
      <Button type="primary" htmlType="submit">
        {t('action.save')}
      </Button>
    </form>
  )
}

function Guests() {
  const t = useT()
  const { label, fields, renderItem, append, remove, errorMessage } = useArrayField()
  return (
    <Card title={label} size="small" style={fullRow}>
      {fields.map((item, index) => (
        <Flex key={item.id} gap={8} align="end">
          <div style={{ flex: 1 }}>{renderItem(item, index)}</div>
          <Button danger type="link" style={{ marginBottom: 12 }} onClick={() => remove(index)}>
            {t('action.remove')}
          </Button>
        </Flex>
      ))}
      {errorMessage && <Typography.Text type="danger">{errorMessage}</Typography.Text>}
      <Button type="dashed" block onClick={() => append({ name: '' }, { shouldFocus: false })}>
        {t('action.addGuest')}
      </Button>
    </Card>
  )
}

export const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => <Root onSubmit={onSubmit}>{children}</Root>,
  fieldMapping: defineMapping(fields),
})

// Labels are i18n keys; `props` is Ant Design's own API (InputProps, SelectProps, ...)
export const buildConfig = (t: Translator) =>
  defineConfig<Registration>({
    name: { type: 'text', label: 'field.name', rules: { required: true } },
    email: {
      type: 'text',
      label: 'field.email',
      rules: { required: true, pattern: '^\\S+@\\S+\\.\\S+$' },
      props: { type: 'email', placeholder: 'hint.email', prefix: '@' },
    },
    ticket: {
      type: 'select',
      label: 'field.ticket',
      props: {
        options: [
          { value: 'standard', label: t('ticket.standard') },
          { value: 'student', label: t('ticket.student') },
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
      props: { placeholder: 'hint.promoCode', allowClear: true },
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
        <Card title={label} size="small" style={fullRow}>
          <div style={grid}>{children}</div>
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
      props: { variant: 'filled', prefix: '$' },
    },
  })
