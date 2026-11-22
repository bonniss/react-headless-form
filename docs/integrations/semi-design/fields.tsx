import { Checkbox, Input, Select, Typography } from '@douyinfe/semi-ui-19'
import type { ComponentProps, ReactNode } from 'react'
import { type AdapterProps, useField } from 'react-headless-form'

// Semi's Form.* fields need Semi's Form: plain markup for label and message
function FieldShell({ children }: { children: ReactNode }) {
  const { id, label, errorMessage, required } = useField()
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <label htmlFor={id}>
        {label}
        {required && ' *'}
      </label>
      {children}
      {errorMessage && <Typography.Text type="danger">{errorMessage}</Typography.Text>}
    </div>
  )
}

// AdapterProps: Semi's own props minus what useField() controls, and what is set below
export type TextFieldProps = AdapterProps<ComponentProps<typeof Input>, 'id' | 'validateStatus' | 'readonly'>

function TextField(props: TextFieldProps) {
  const { id, value, onChange, onBlur, errorMessage, disabled, readOnly } = useField()
  return (
    <FieldShell>
      <Input
        {...props}
        id={id}
        value={value ?? ''}
        onChange={next => onChange(next)} // value first, event second
        onBlur={onBlur}
        validateStatus={errorMessage ? 'error' : 'default'}
        disabled={disabled}
        readonly={readOnly}
      />
    </FieldShell>
  )
}

/** `optionList` comes from the config, in Semi's own shape. */
export type SelectFieldProps = AdapterProps<ComponentProps<typeof Select>, 'id' | 'validateStatus'>

function SelectField(props: SelectFieldProps) {
  const { id, value, onChange, onBlur, errorMessage, disabled } = useField()
  return (
    <FieldShell>
      <Select
        style={{ width: '100%' }}
        {...props}
        id={id}
        value={value}
        onChange={next => onChange(next)}
        onBlur={onBlur}
        validateStatus={errorMessage ? 'error' : 'default'}
        disabled={disabled}
      />
    </FieldShell>
  )
}

export type CheckboxFieldProps = AdapterProps<ComponentProps<typeof Checkbox>, 'checked'>

function CheckboxField(props: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <Checkbox {...props} checked={Boolean(value)} onChange={e => onChange(Boolean(e.target.checked))} disabled={disabled}>
      {label}
    </Checkbox>
  )
}

export const fields = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}
