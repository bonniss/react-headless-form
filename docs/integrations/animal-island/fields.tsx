import { Input, Select, Switch } from 'animal-island-ui'
import type { CSSProperties, ReactNode } from 'react'
import { useField } from 'react-headless-form'
import type { InputProps, SelectProps, SwitchProps } from 'animal-island-ui'

const stack: CSSProperties = { display: 'grid', gap: 12 }

// animal-island-ui has no form-field wrapper: label and error are plain markup.
function FieldRow({ children }: { children: ReactNode }) {
  const { id, label, errorMessage, required } = useField()
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <label htmlFor={id}>
        {label}
        {required && ' *'}
      </label>
      {children}
      {errorMessage && <span style={{ color: '#d9534f', fontSize: 13 }}>{errorMessage}</span>}
    </div>
  )
}

// Each adapter takes the library's own props, minus what useField() controls,
// so `props` in the config is typed (and autocompleted) as animal-island-ui's.
type Controlled = 'id' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'status' | 'disabled' | 'readOnly'

export type TextFieldProps = Omit<InputProps, Controlled>

function TextField(props: TextFieldProps) {
  const { id, value, onChange, onBlur, errorMessage, disabled, readOnly } = useField()
  return (
    <FieldRow>
      <Input
        {...props}
        id={id}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        status={errorMessage ? 'error' : undefined}
        disabled={disabled}
        readOnly={readOnly}
      />
    </FieldRow>
  )
}


/** `options` come from the config, in animal-island-ui's shape (`key`). */
export type SelectFieldProps = Omit<SelectProps, 'value' | 'defaultValue' | 'onChange' | 'disabled' | 'aria-label'>

function SelectField(props: SelectFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <FieldRow>
      {/* onChange passes the key, not an event */}
      <Select
        {...props}
        aria-label={typeof label === 'string' ? label : undefined}
        value={value}
        onChange={key => onChange(key)}
        disabled={disabled}
      />
    </FieldRow>
  )
}

// Its Checkbox is a group (array of values); a Switch fits a boolean.
export type CheckboxFieldProps = Omit<SwitchProps, 'checked' | 'defaultChecked' | 'onChange' | 'disabled'>

function CheckboxField(props: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Switch {...props} checked={Boolean(value)} onChange={checked => onChange(checked)} disabled={disabled} />
      {label}
    </label>
  )
}

export const fields = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}
