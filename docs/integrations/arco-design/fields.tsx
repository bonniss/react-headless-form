import { useId } from 'react'
import { Checkbox, Input, Select, Typography } from '@arco-design/web-react'
import type { ComponentProps, ReactNode } from 'react'
import { type AdapterProps, useField } from 'react-headless-form'

// Arco's Form.Item needs Arco's Form instance: plain markup for label and message
function FieldShell({ id, children }: { id: string; children: ReactNode }) {
  const { label, errorMessage, required } = useField()
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <label htmlFor={id}>
        {label}
        {required && ' *'}
      </label>
      {children}
      {errorMessage && <Typography.Text type="error">{errorMessage}</Typography.Text>}
    </div>
  )
}

// AdapterProps: Arco's own props minus what useField() controls, and what is set below
export type TextFieldProps = AdapterProps<ComponentProps<typeof Input>, 'id' | 'status'>

function TextField(props: TextFieldProps) {
  const id = useId()
  const { value, onChange, onBlur, errorMessage, disabled, readOnly } = useField()
  return (
    <FieldShell id={id}>
      <Input
        {...props}
        id={id}
        value={value ?? ''}
        onChange={next => onChange(next)} // value, not an event
        onBlur={onBlur}
        status={errorMessage ? 'error' : undefined}
        disabled={disabled}
        readOnly={readOnly}
      />
    </FieldShell>
  )
}

/** `options` come from the config, in Arco's own shape. */
export type SelectFieldProps = AdapterProps<ComponentProps<typeof Select>, 'id' | 'status'>

function SelectField(props: SelectFieldProps) {
  const id = useId()
  const { value, onChange, onBlur, errorMessage, disabled } = useField()
  return (
    <FieldShell id={id}>
      <Select
        {...props}
        id={id}
        value={value}
        onChange={next => onChange(next)}
        onBlur={onBlur}
        status={errorMessage ? 'error' : undefined}
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
