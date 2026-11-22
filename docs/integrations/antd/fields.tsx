import { useId } from 'react'
import { Checkbox, Form, Input, Select } from 'antd'
import { type AdapterProps, useField } from 'react-headless-form'
import type { CheckboxProps, InputProps, SelectProps } from 'antd'

// Form.Item is used for layout only; values and errors come from useField().
function Item({ id, children }: { id: string; children: React.ReactNode }) {
  const { label, errorMessage, required } = useField()
  return (
    <Form.Item
      label={label}
      htmlFor={id}
      required={required}
      validateStatus={errorMessage ? 'error' : undefined}
      help={errorMessage}
      layout="vertical"
      style={{ marginBottom: 12 }}
    >
      {children}
    </Form.Item>
  )
}

// AdapterProps: the library's own props minus what useField() controls (value,
// onChange, label, disabled, ...) and `Extra`, the props this adapter also sets.
// So `props` in the config is typed (and autocompleted) as Ant Design's props.
type Extra = 'id' | 'status'

export type TextFieldProps = AdapterProps<InputProps, Extra>

function TextField(props: TextFieldProps) {
  const id = useId()
  const { value, onChange, onBlur, errorMessage, disabled, readOnly } = useField()
  return (
    <Item id={id}>
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
    </Item>
  )
}


/** `options` come from the config, in antd's own shape. */
export type SelectFieldProps = AdapterProps<SelectProps<string>, Extra>

function SelectField(props: SelectFieldProps) {
  const id = useId()
  const { value, onChange, onBlur, errorMessage, disabled } = useField()
  return (
    <Item id={id}>
      {/* antd passes the value, not an event */}
      <Select
        {...props}
        id={id}
        value={value}
        onChange={next => onChange(next)}
        onBlur={onBlur}
        status={errorMessage ? 'error' : undefined}
        disabled={disabled}
      />
    </Item>
  )
}

export type CheckboxFieldProps = AdapterProps<CheckboxProps, Extra | 'checked'>

function CheckboxField(props: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <Form.Item style={{ marginBottom: 12 }}>
      <Checkbox {...props} checked={Boolean(value)} onChange={e => onChange(e.target.checked)} disabled={disabled}>
        {label}
      </Checkbox>
    </Form.Item>
  )
}

export const fields = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}
