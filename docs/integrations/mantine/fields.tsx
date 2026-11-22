import { Checkbox, Select, TextInput } from '@mantine/core'
import { useField } from 'react-headless-form'
import type { CheckboxProps, SelectProps, TextInputProps } from '@mantine/core'

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
  select: SelectField,
  checkbox: CheckboxField,
}
