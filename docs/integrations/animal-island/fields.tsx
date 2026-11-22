import { Button, Card, Input, Select, Switch, Title } from 'animal-island-ui'
import type { CSSProperties, ReactNode } from 'react'
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

function TextField({ type, placeholder }: TextFieldProps) {
  const { id, value, onChange, onBlur, errorMessage, disabled, readOnly } = useField()
  return (
    <FieldRow>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
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

// No TextArea in animal-island-ui: a single-line Input stands in.
function LongTextField(_: LongTextFieldProps) {
  const { id, value, onChange, onBlur, disabled } = useField()
  return (
    <FieldRow>
      <Input id={id} value={value ?? ''} onChange={e => onChange(e.target.value)} onBlur={onBlur} disabled={disabled} />
    </FieldRow>
  )
}

function SelectField({ options }: SelectFieldProps) {
  const { value, onChange, label } = useField()
  return (
    <FieldRow>
      {/* options use `key`; onChange passes the key, not an event */}
      <Select
        aria-label={typeof label === 'string' ? label : undefined}
        options={options.map(option => ({ key: option.value, label: option.label }))}
        value={value}
        onChange={key => onChange(key)}
      />
    </FieldRow>
  )
}

// Its Checkbox is a group (array of values); a Switch fits a boolean.
function CheckboxField(_: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Switch checked={Boolean(value)} onChange={checked => onChange(checked)} disabled={disabled} />
      {label}
    </label>
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
      <form id={id} onSubmit={onSubmit} noValidate style={stack}>
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
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map(option => (
        <Button
          key={option.value}
          size="small"
          type={option.value === value ? 'primary' : 'default'}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  ),
  Section: ({ title, children }) => (
    <Card color="app-blue" style={stack}>
      <Title size="small" color="app-blue">
        {title}
      </Title>
      {children}
    </Card>
  ),
  LinesList: () => {
    const t = useT()
    const { label, items, renderItem, append, remove, errorMessage } = useArrayField()
    return (
      <Card color="app-yellow" style={stack}>
        <Title size="small" color="app-yellow">
          {label}
        </Title>
        {items.map((item, index) => (
          <Card key={item.id} type="dashed" style={stack}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{renderItem(item, index)}</div>
            <Button type="text" size="small" onClick={() => remove(index)}>
              {t('action.remove')}
            </Button>
          </Card>
        ))}
        {errorMessage && <span style={{ color: '#d9534f', fontSize: 13 }}>{errorMessage}</span>}
        <Button type="dashed" onClick={() => append({ item: '', qty: '1', price: '' })}>
          {t('action.addLine')}
        </Button>
      </Card>
    )
  },
}
