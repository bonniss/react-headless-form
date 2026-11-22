import { Box, Button, Card, Heading, HStack, SimpleGrid, Text } from '@chakra-ui/react'
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

// renderRoot: the whole form, with a title and a responsive grid
function Root({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) {
  const t = useT()
  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate>
      <Heading size="xl" mb="4">
        {t('title')}
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
        {children}
      </SimpleGrid>
      <Button type="submit" mt="4">
        {t('action.save')}
      </Button>
    </form>
  )
}

function Guests() {
  const t = useT()
  const { label, fields, renderItem, append, remove, errorMessage } = useArrayField()
  const add = () => append({ name: '' }, { shouldFocus: false })
  return (
    <Card.Root gridColumn="1 / -1">
      <Card.Body gap="3">
        <Card.Title>{label}</Card.Title>
        {fields.map((item, index) => (
          <HStack key={item.id} align="end">
            <Box flex="1">{renderItem(item, index)}</Box>
            <Button variant="ghost" colorPalette="red" onClick={() => remove(index)}>
              {t('action.remove')}
            </Button>
          </HStack>
        ))}
        {errorMessage && (
          <Text color="fg.error" textStyle="sm">
            {errorMessage}
          </Text>
        )}
        <Button variant="outline" onClick={add}>
          {t('action.addGuest')}
        </Button>
      </Card.Body>
    </Card.Root>
  )
}

export const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => <Root onSubmit={onSubmit}>{children}</Root>,
  fieldMapping: defineMapping(fields),
})

// Labels are i18n keys; `props` is Chakra UI's own API, typed by its components
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
        // a native select: the options are its children
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
      props: { placeholder: 'hint.promoCode', variant: 'subtle' },
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
        <Card.Root gridColumn="1 / -1">
          <Card.Body gap="3">
            <Card.Title>{label}</Card.Title>
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
              {children}
            </SimpleGrid>
          </Card.Body>
        </Card.Root>
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
      props: { variant: 'subtle', fontWeight: 'bold' },
    },
  })
