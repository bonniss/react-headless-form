import { useId } from 'react'
import { Input, Select, Switch } from 'animal-island-ui'
import type { CSSProperties, ReactNode } from 'react'
import { type AdapterProps, useField } from 'react-headless-form'
import type { InputProps, SelectProps, SwitchProps } from 'animal-island-ui'

const stack: CSSProperties = { display: 'grid', gap: 12 }

// animal-island-ui has no form-field wrapper: label and error are plain markup.
function FieldRow({ id, children }: { id: string; children: ReactNode }) {
  const { label, errorMessage, required } = useField()
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

// AdapterProps: the library's own props minus what useField() controls (value,
// onChange, label, disabled, ...) and `Extra`, the props this adapter also sets.
// So `props` in the config is typed (and autocompleted) as animal-island-ui's.
type Extra = 'id' | 'status'

export type TextFieldProps = AdapterProps<InputProps, Extra>

function TextField(props: TextFieldProps) {
  const id = useId()
  const { value, onChange, onBlur, errorMessage, disabled, readOnly } = useField()
  return (
    <FieldRow id={id}>
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
export type SelectFieldProps = AdapterProps<SelectProps, 'aria-label'>

function SelectField(props: SelectFieldProps) {
  const id = useId() // its Select takes no id: the label names it through aria-label
  const { value, onChange, label, disabled } = useField()
  return (
    <FieldRow id={id}>
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
export type CheckboxFieldProps = AdapterProps<SwitchProps, 'checked' | 'defaultChecked'>

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
