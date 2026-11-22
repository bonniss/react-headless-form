import type { ReactNode } from 'react'
import { defineMapping, setupForm, useArrayField } from 'react-headless-form'
import { Button, Text, View } from 'react-native'
import { type Translator, useT } from '../shared/i18n'
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

// renderRoot: there is no <form> in React Native, so submit is a Button calling onSubmit
function Root({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) {
  const t = useT()
  return (
    <View style={styles.form}>
      <Text style={styles.title}>{t('title')}</Text>
      <View style={styles.grid}>{children}</View>
      <Button title={t('action.save')} onPress={() => onSubmit()} />
    </View>
  )
}

function Guests() {
  const t = useT()
  const { label, items, renderItem, append, remove, errorMessage } = useArrayField()
  const add = () => append({ name: '' }, { shouldFocus: false })
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{label}</Text>
      {items.map((item, index) => (
        <View key={item.id} style={styles.guest}>
          <View style={{ flex: 1 }}>{renderItem(item, index)}</View>
          <Button title={t('action.remove')} color="#dc2626" onPress={() => remove(index)} />
        </View>
      ))}
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      <Button title={t('action.addGuest')} onPress={add} />
    </View>
  )
}

export const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => <Root onSubmit={onSubmit}>{children}</Root>,
  fieldMapping: defineMapping(fields),
})

// Labels are i18n keys; `props` is React Native's own API (TextInputProps, ...)
export const buildConfig = (t: Translator) =>
  defineConfig<Registration>({
    name: { type: 'text', label: 'field.name', rules: { required: true } },
    email: {
      type: 'text',
      label: 'field.email',
      rules: { required: true, pattern: '^\\S+@\\S+\\.\\S+$' },
      props: { placeholder: 'hint.email', keyboardType: 'email-address', autoCapitalize: 'none' },
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
      props: { placeholder: 'hint.promoCode', autoCapitalize: 'characters' },
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
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{label}</Text>
          <View style={styles.grid}>{children}</View>
        </View>
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
      props: { style: { fontWeight: '700' } },
    },
  })

// Plain style objects: React Native Web accepts them as `style`
const styles = {
  form: { gap: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { flexBasis: '100%', gap: 8, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 },
  cardTitle: { fontWeight: '700' },
  guest: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  error: { color: '#dc2626', fontSize: 12 },
} as const
