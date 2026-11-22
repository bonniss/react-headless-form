import { Checkbox, Form, Input, Select } from 'antd'
import { useField } from 'react-headless-form'
import type { CheckboxProps, InputProps, SelectProps } from 'antd'

// Form.Item is used for layout only; values and errors come from useField().
function Item({ children }: { children: React.ReactNode }) {
  const { id, label, errorMessage, required } = useField()
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

// Each adapter takes the library's own props, minus what useField() controls,
// so `props` in the config is typed (and autocompleted) as Ant Design's props.
type Controlled = 'id' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'status' | 'disabled' | 'readOnly'

export type TextFieldProps = Omit<InputProps, Controlled>

function TextField(props: TextFieldProps) {
  const { id, value, onChange, onBlur, errorMessage, disabled, readOnly } = useField()
  return (
    <Item>
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
export type SelectFieldProps = Omit<SelectProps<string>, Controlled>

function SelectField(props: SelectFieldProps) {
  const { id, value, onChange, onBlur, errorMessage, disabled } = useField()
  return (
    <Item>
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

export type CheckboxFieldProps = Omit<CheckboxProps, Controlled | 'checked'>

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
