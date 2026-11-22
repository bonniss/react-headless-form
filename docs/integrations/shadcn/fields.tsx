import { useId } from 'react'
import type { ReactNode } from 'react'
import { type AdapterProps, useField } from 'react-headless-form'
import type { ComponentProps } from 'react'
import { Checkbox, Input, Label, NativeSelect } from './ui'

// Label + control + message, like shadcn's <FormItem>.
function FieldItem({ id, children }: { id: string; children: ReactNode }) {
  const { label, errorMessage, required } = useField()
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

// AdapterProps: the component's own props minus what useField() controls (value,
// onChange, label, disabled, ...) and `Extra`, the props this adapter also sets.
type Extra = 'id'

export type TextFieldProps = AdapterProps<ComponentProps<typeof Input>, Extra>

function TextField(props: TextFieldProps) {
  const id = useId()
  const { value, onChange, onBlur, ref, errorMessage, disabled, readOnly } = useField()
  return (
    <FieldItem id={id}>
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
export type SelectFieldProps = AdapterProps<ComponentProps<typeof NativeSelect>, Extra>

function SelectField(props: SelectFieldProps) {
  const id = useId()
  const { value, onChange, onBlur, disabled } = useField()
  return (
    <FieldItem id={id}>
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

export type CheckboxFieldProps = AdapterProps<ComponentProps<typeof Checkbox>, Extra | 'checked' | 'type'>

function CheckboxField(props: CheckboxFieldProps) {
  const id = useId()
  const { value, onChange, label, disabled } = useField()
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
