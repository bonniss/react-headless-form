import { Checkbox, Select, TextInput } from '@mantine/core'
import { type AdapterProps, useField } from 'react-headless-form'
import type { CheckboxProps, SelectProps, TextInputProps } from '@mantine/core'

// AdapterProps: the library's own props minus what useField() controls (value,
// onChange, label, disabled, ...) and `Extra`, the props this adapter also sets.
// So `props` in the config is typed (and autocompleted) as Mantine's props.
type Extra = 'error'

export type TextFieldProps = AdapterProps<TextInputProps, Extra | 'withAsterisk'>

function TextField(props: TextFieldProps) {
  const { value, onChange, onBlur, ref, label, description, errorMessage, required, disabled, readOnly } = useField()
  return (
    <TextInput
      {...props}
      ref={ref}
      label={label}
      description={description ?? props.description} // the field's description, translated
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
export type SelectFieldProps = AdapterProps<SelectProps, Extra>

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

export type CheckboxFieldProps = AdapterProps<CheckboxProps, Extra | 'checked'>

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
