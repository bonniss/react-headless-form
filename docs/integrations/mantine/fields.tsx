import { Button, Card, Checkbox, Group, Select, Stack, TextInput, Textarea, Title } from '@mantine/core'
import { useArrayField, useField } from 'react-headless-form'
import type {
  CheckboxFieldProps,
  Fields,
  LongTextFieldProps,
  SelectFieldProps,
  Shells,
  TextFieldProps,
} from '../shared/types'
import { useT } from '../shared/i18n'

function TextField(props: TextFieldProps) {
  const { value, onChange, onBlur, ref, label, errorMessage, required, disabled, readOnly } = useField()
  return (
    <TextInput
      {...props}
      ref={ref}
      label={label}
      value={value ?? ''}
      onChange={e => onChange(e.currentTarget.value)}
      onBlur={onBlur}
      error={errorMessage}
      withAsterisk={required}
      disabled={disabled}
      readOnly={readOnly}
    />
  )
}

function LongTextField(props: LongTextFieldProps) {
  const { value, onChange, onBlur, ref, label, errorMessage, disabled } = useField()
  return (
    <Textarea
      {...props}
      ref={ref}
      label={label}
      value={value ?? ''}
      onChange={e => onChange(e.currentTarget.value)}
      onBlur={onBlur}
      error={errorMessage}
      disabled={disabled}
    />
  )
}

function SelectField({ options }: SelectFieldProps) {
  const { value, onChange, onBlur, label, errorMessage, disabled } = useField()
  return (
    <Select
      data={options}
      label={label}
      value={value ?? null}
      onChange={next => onChange(next)} // value, not an event
      onBlur={onBlur}
      error={errorMessage}
      disabled={disabled}
      allowDeselect={false}
    />
  )
}

function CheckboxField(_: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <Checkbox
      label={label}
      checked={Boolean(value)}
      onChange={e => onChange(e.currentTarget.checked)}
      disabled={disabled}
    />
  )
}

export const fields: Fields = {
  text: TextField,
  longText: LongTextField,
  select: SelectField,
  checkbox: CheckboxField,
}

export const shells: Shells = {
  Root: ({ children, onSubmit }) => {
    const t = useT()
    return (
      <form onSubmit={onSubmit}>
        <Stack>
          {children}
          <Button type="submit">{t('action.save')}</Button>
        </Stack>
      </form>
    )
  },
  Section: ({ title, children }) => (
    <Card withBorder>
      <Title order={5} mb="sm">
        {title}
      </Title>
      <Stack>{children}</Stack>
    </Card>
  ),
  AddressList: () => {
    const t = useT()
    const { label, items, renderItem, append, remove } = useArrayField()
    return (
      <Card withBorder>
        <Title order={5} mb="sm">
          {label}
        </Title>
        <Stack>
          {items.map((item, index) => (
            <Group key={item.id} align="end" grow>
              {renderItem(item, index)}
              <Button variant="subtle" color="red" onClick={() => remove(index)}>
                {t('action.remove')}
              </Button>
            </Group>
          ))}
          <Button variant="light" onClick={() => append({ street: '', city: '' })}>
            {t('action.add')}
          </Button>
        </Stack>
      </Card>
    )
  },
}
