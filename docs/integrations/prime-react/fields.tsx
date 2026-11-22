import { Checkbox, type CheckboxProps } from 'primereact/checkbox'
import { Dropdown, type DropdownProps } from 'primereact/dropdown'
import { InputText, type InputTextProps } from 'primereact/inputtext'
import type { ReactNode } from 'react'
import { type AdapterProps, useField } from 'react-headless-form'

// PrimeReact inputs carry no label or message: plain markup with its classes
function FieldShell({ children }: { children: ReactNode }) {
  const { id, label, errorMessage, required } = useField()
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label htmlFor={id}>
        {label}
        {required && ' *'}
      </label>
      {children}
      {errorMessage && <small className="p-error">{errorMessage}</small>}
    </div>
  )
}

// AdapterProps: PrimeReact's own props minus what useField() controls, and what is set below
export type TextFieldProps = AdapterProps<InputTextProps, 'id' | 'invalid'>

function TextField(props: TextFieldProps) {
  const { id, value, onChange, onBlur, ref, errorMessage, disabled, readOnly } = useField()
  return (
    <FieldShell>
      <InputText
        {...props}
        id={id}
        ref={ref}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        invalid={Boolean(errorMessage)}
        disabled={disabled}
        readOnly={readOnly}
      />
    </FieldShell>
  )
}

/** `options` come from the config, as `{ value, label }`. */
export type SelectFieldProps = AdapterProps<DropdownProps, 'inputId' | 'invalid'>

function SelectField(props: SelectFieldProps) {
  const { id, value, onChange, onBlur, errorMessage, disabled } = useField()
  return (
    <FieldShell>
      <Dropdown
        optionLabel="label"
        optionValue="value"
        {...props}
        inputId={id}
        value={value}
        onChange={e => onChange(e.value)} // e.value, not the event
        onBlur={onBlur}
        invalid={Boolean(errorMessage)}
        disabled={disabled}
      />
    </FieldShell>
  )
}

export type CheckboxFieldProps = AdapterProps<CheckboxProps, 'inputId' | 'checked'>

function CheckboxField(props: CheckboxFieldProps) {
  const { id, value, onChange, label, disabled } = useField()
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Checkbox {...props} inputId={id} checked={Boolean(value)} onChange={e => onChange(Boolean(e.checked))} disabled={disabled} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

export const fields = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}
