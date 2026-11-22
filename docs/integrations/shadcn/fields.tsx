import type { ReactNode } from 'react'
import { useField } from 'react-headless-form'
import type { ComponentProps } from 'react'
import { Checkbox, Input, Label, NativeSelect } from './ui'

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

// Each adapter takes the component's own props, minus what useField()
// controls, so `props` in the config is typed as the shadcn component's props.
type Controlled = 'id' | 'ref' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'disabled' | 'readOnly'

export type TextFieldProps = Omit<ComponentProps<typeof Input>, Controlled>

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


/** A native select: the `<option>` children come from the config. */
export type SelectFieldProps = Omit<ComponentProps<typeof NativeSelect>, Controlled>

function SelectField(props: SelectFieldProps) {
  const { id, value, onChange, onBlur, disabled } = useField()
  return (
    <FieldItem>
      <NativeSelect
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

export type CheckboxFieldProps = Omit<ComponentProps<typeof Checkbox>, Controlled | 'checked' | 'type'>

function CheckboxField(props: CheckboxFieldProps) {
  const { id, value, onChange, label, disabled } = useField()
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        {...props}
        id={id}
        checked={Boolean(value)}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

export const fields = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}
