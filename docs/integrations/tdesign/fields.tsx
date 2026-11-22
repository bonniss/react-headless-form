import { Checkbox, Input, Select } from 'tdesign-react'
import type { ComponentProps, ReactNode } from 'react'
import { type AdapterProps, useField } from 'react-headless-form'

// TDesign's Form.FormItem needs TDesign's Form: a wrapping <label> names the input
function FieldShell({ children }: { children: ReactNode }) {
  const { label, errorMessage, required } = useField()
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <label style={{ display: 'grid', gap: 4 }}>
        <span>
          {label}
          {required && ' *'}
        </span>
        {children}
      </label>
      {errorMessage && <div style={{ color: 'var(--td-error-color)', fontSize: 12 }}>{errorMessage}</div>}
    </div>
  )
}

// AdapterProps: TDesign's own props minus what useField() controls, and what is set below
export type TextFieldProps = AdapterProps<ComponentProps<typeof Input>, 'status' | 'readonly'>

function TextField(props: TextFieldProps) {
  const { value, onChange, onBlur, errorMessage, disabled, readOnly } = useField()
  return (
    <FieldShell>
      <Input
        {...props}
        value={value ?? ''}
        onChange={next => onChange(next)} // value, not an event
        onBlur={() => onBlur()}
        status={errorMessage ? 'error' : 'default'}
        disabled={disabled}
        readonly={readOnly}
      />
    </FieldShell>
  )
}

/** `options` come from the config, in TDesign's own shape. */
export type SelectFieldProps = AdapterProps<ComponentProps<typeof Select>, 'status'>

function SelectField(props: SelectFieldProps) {
  const { value, onChange, onBlur, errorMessage, disabled } = useField()
  return (
    <FieldShell>
      <Select
        {...props}
        value={value}
        onChange={next => onChange(next)}
        onBlur={() => onBlur()}
        status={errorMessage ? 'error' : 'default'}
        disabled={disabled}
      />
    </FieldShell>
  )
}

export type CheckboxFieldProps = AdapterProps<ComponentProps<typeof Checkbox>, 'checked'>

function CheckboxField(props: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <Checkbox {...props} checked={Boolean(value)} onChange={checked => onChange(checked)} disabled={disabled}>
      {label}
    </Checkbox>
  )
}

export const fields = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}
