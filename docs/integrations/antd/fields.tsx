import { Button, Card, Checkbox, Flex, Form, Input, Segmented, Select, Typography } from 'antd'
import { useArrayField, useField } from 'react-headless-form'
import type {
  CheckboxFieldProps,
  Fields,
  LongTextFieldProps,
  SelectFieldProps,
  Shells,
  TextFieldProps,
} from '../shared/types'
import { useT } from '../shared/i18n'

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

function TextField({ type, placeholder }: TextFieldProps) {
  const { id, value, onChange, onBlur, disabled, readOnly } = useField()
  const Component = type === 'password' ? Input.Password : Input
  return (
    <Item>
      <Component
        id={id}
        type={type === 'password' ? undefined : type}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
      />
    </Item>
  )
}

function LongTextField({ rows }: LongTextFieldProps) {
  const { id, value, onChange, onBlur, disabled } = useField()
  return (
    <Item>
      <Input.TextArea
        id={id}
        rows={rows}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
      />
    </Item>
  )
}

function SelectField({ options }: SelectFieldProps) {
  const { id, value, onChange, onBlur, disabled } = useField()
  return (
    <Item>
      {/* antd passes the value, not an event */}
      <Select
        id={id}
        options={options}
        value={value}
        onChange={next => onChange(next)}
        onBlur={onBlur}
        disabled={disabled}
      />
    </Item>
  )
}

function CheckboxField(_: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <Form.Item style={{ marginBottom: 12 }}>
      <Checkbox checked={Boolean(value)} onChange={e => onChange(e.target.checked)} disabled={disabled}>
        {label}
      </Checkbox>
    </Form.Item>
  )
}

export const fields: Fields = {
  text: TextField,
  longText: LongTextField,
  select: SelectField,
  checkbox: CheckboxField,
}

export const shells: Shells = {
  Root: ({ id, children, onSubmit }) => {
    const t = useT()
    return (
      <form id={id} onSubmit={onSubmit} noValidate>
        {children}
        <Button type="primary" htmlType="submit">
          {t('action.save')}
        </Button>
      </form>
    )
  },
  SubmitButton: ({ form, children }) => (
    <Button type="primary" htmlType="submit" form={form} size="small">
      {children}
    </Button>
  ),
  LanguageSwitch: ({ value, options, onChange }) => (
    <Segmented size="small" value={value} options={options} onChange={next => onChange(String(next))} />
  ),
  Section: ({ title, children }) => (
    <Card title={title} size="small" style={{ marginBottom: 12 }}>
      {children}
    </Card>
  ),
  LinesList: () => {
    const t = useT()
    const { label, items, renderItem, append, remove, errorMessage } = useArrayField()
    return (
      <Card title={label} size="small" style={{ marginBottom: 12 }}>
        {items.map((item, index) => (
          <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 8 }}>{renderItem(item, index)}</div>
            <Button danger type="link" size="small" onClick={() => remove(index)}>
              {t('action.remove')}
            </Button>
          </Card>
        ))}
        {errorMessage && <Typography.Text type="danger">{errorMessage}</Typography.Text>}
        <Button type="dashed" block onClick={() => append({ item: '', qty: '1', price: '' })}>
          {t('action.addLine')}
        </Button>
      </Card>
    )
  },
}
