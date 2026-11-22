import { Button, Card, Checkbox, Group, SegmentedControl, Select, SimpleGrid, Stack, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useArrayField, useField } from 'react-headless-form'
import type { CheckboxProps, SelectProps, TextareaProps, TextInputProps } from '@mantine/core'
import type { Shells } from '../shared/types'
import { useT } from '../shared/i18n'

// Each adapter takes the library's own props, minus what useField() controls,
// so `props` in the config is typed (and autocompleted) as Mantine's props.
type Controlled = 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'error' | 'label' | 'disabled' | 'readOnly'

export type TextFieldProps = Omit<TextInputProps, Controlled | 'withAsterisk'>

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

export type LongTextFieldProps = Omit<TextareaProps, Controlled>

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

/** `data` (the options) comes from the config, in Mantine's own shape. */
export type SelectFieldProps = Omit<SelectProps, Controlled>

function SelectField(props: SelectFieldProps) {
  const { value, onChange, onBlur, label, errorMessage, disabled } = useField()
  return (
    <Select
      allowDeselect={false}
      {...props}
      label={label}
      value={value ?? null}
      onChange={next => onChange(next)} // value, not an event
      onBlur={onBlur}
      error={errorMessage}
      disabled={disabled}
    />
  )
}

export type CheckboxFieldProps = Omit<CheckboxProps, Controlled | 'checked'>

function CheckboxField(props: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <Checkbox
      {...props}
      label={label}
      checked={Boolean(value)}
      onChange={e => onChange(e.currentTarget.checked)}
      disabled={disabled}
    />
  )
}

export const fields = {
  text: TextField,
  longText: LongTextField,
  select: SelectField,
  checkbox: CheckboxField,
}

export const shells: Shells = {
  Root: ({ id, children, onSubmit }) => {
    const t = useT()
    return (
      <form id={id} onSubmit={onSubmit} noValidate>
        <Stack>
          {children}
          <Button type="submit">{t('action.save')}</Button>
        </Stack>
      </form>
    )
  },
  SubmitButton: ({ form, children }) => (
    <Button type="submit" form={form} size="xs">
      {children}
    </Button>
  ),
  LanguageSwitch: ({ value, options, onChange }) => (
    <SegmentedControl size="xs" value={value} data={options} onChange={onChange} />
  ),
  Section: ({ title, children }) => (
    <Card withBorder>
      <Title order={5} mb="sm">
        {title}
      </Title>
      <Stack>{children}</Stack>
    </Card>
  ),
  LinesList: () => {
    const t = useT()
    const { label, items, renderItem, append, remove, errorMessage } = useArrayField()
    return (
      <Card withBorder>
        <Title order={5} mb="sm">
          {label}
        </Title>
        <Stack>
          {items.map((item, index) => (
            <Card key={item.id} withBorder padding="sm">
              <SimpleGrid cols={2}>{renderItem(item, index)}</SimpleGrid>
              <Button variant="subtle" color="red" size="xs" mt="xs" onClick={() => remove(index)}>
                {t('action.remove')}
              </Button>
            </Card>
          ))}
          {errorMessage && (
            <Text c="red" size="sm">
              {errorMessage}
            </Text>
          )}
          <Button variant="light" onClick={() => append({ item: '', qty: '1', price: '' })}>
            {t('action.addLine')}
          </Button>
        </Stack>
      </Card>
    )
  },
}
