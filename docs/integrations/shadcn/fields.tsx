import type { ReactNode } from 'react'
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
import { Button, Card, CardTitle, Checkbox, Input, Label, NativeSelect, Textarea } from './ui'

// Label + control + message, like shadcn's <FormItem>.
function FieldItem({ children }: { children: ReactNode }) {
  const { id, label, errorMessage, required } = useField()
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </Label>
      {children}
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
    </div>
  )
}

function TextField(props: TextFieldProps) {
  const { id, value, onChange, onBlur, ref, errorMessage, disabled, readOnly } = useField()
  return (
    <FieldItem>
      <Input
        {...props}
        id={id}
        ref={ref}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(errorMessage)}
        disabled={disabled}
        readOnly={readOnly}
      />
    </FieldItem>
  )
}

function LongTextField(props: LongTextFieldProps) {
  const { id, value, onChange, onBlur, disabled } = useField()
  return (
    <FieldItem>
      <Textarea
        {...props}
        id={id}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
      />
    </FieldItem>
  )
}

function SelectField({ options }: SelectFieldProps) {
  const { id, value, onChange, onBlur, disabled } = useField()
  return (
    <FieldItem>
      <NativeSelect
        id={id}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect>
    </FieldItem>
  )
}

function CheckboxField(_: CheckboxFieldProps) {
  const { id, value, onChange, label, disabled } = useField()
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={Boolean(value)} onChange={e => onChange(e.target.checked)} disabled={disabled} />
      <Label htmlFor={id}>{label}</Label>
    </div>
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
      <form id={id} onSubmit={onSubmit} noValidate className="grid gap-4">
        {children}
        <Button type="submit">{t('action.save')}</Button>
      </form>
    )
  },
  SubmitButton: ({ form, children }) => (
    <Button type="submit" form={form} className="h-8 px-3">
      {children}
    </Button>
  ),
  LanguageSwitch: ({ value, options, onChange }) => (
    <div className="inline-flex gap-1 rounded-lg border border-zinc-200 bg-white p-1">
      {options.map(option => (
        <Button
          key={option.value}
          type="button"
          variant={option.value === value ? 'default' : 'outline'}
          className="h-7 px-3"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  ),
  Section: ({ title, children }) => (
    <Card>
      <CardTitle>{title}</CardTitle>
      {children}
    </Card>
  ),
  LinesList: () => {
    const t = useT()
    const { label, items, renderItem, append, remove, errorMessage } = useArrayField()
    return (
      <Card>
        <CardTitle>{label}</CardTitle>
        {items.map((item, index) => (
          <div key={item.id} className="grid gap-2 rounded-lg border border-zinc-200 p-3">
            <div className="grid grid-cols-2 gap-2">{renderItem(item, index)}</div>
            <Button type="button" variant="ghost" className="h-8 justify-self-start px-2" onClick={() => remove(index)}>
              {t('action.remove')}
            </Button>
          </div>
        ))}
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <Button type="button" variant="outline" onClick={() => append({ item: '', qty: '1', price: '' })}>
          {t('action.addLine')}
        </Button>
      </Card>
    )
  },
}
