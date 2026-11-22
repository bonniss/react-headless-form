import {
  Checkbox,
  type CheckboxRootProps,
  Field,
  Input,
  type InputProps,
  NativeSelect,
  type NativeSelectFieldProps,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { type AdapterProps, useField } from 'react-headless-form'

// Field.Root carries the label, the error and the required / disabled / read-only state
function FieldShell({ children }: { children: ReactNode }) {
  const { label, errorMessage, required, disabled, readOnly } = useField()
  return (
    <Field.Root invalid={Boolean(errorMessage)} required={required} disabled={disabled} readOnly={readOnly}>
      <Field.Label>
        {label} <Field.RequiredIndicator />
      </Field.Label>
      {children}
      <Field.ErrorText>{errorMessage}</Field.ErrorText>
    </Field.Root>
  )
}

// AdapterProps: Chakra's own props minus what useField() controls (value, onChange, label, ...)
export type TextFieldProps = AdapterProps<InputProps>

function TextField(props: TextFieldProps) {
  const { value, onChange, onBlur, ref } = useField()
  return (
    <FieldShell>
      <Input {...props} ref={ref} value={value ?? ''} onChange={e => onChange(e.target.value)} onBlur={onBlur} />
    </FieldShell>
  )
}

/** A native select: the `<option>` children come from the config. */
export type SelectFieldProps = AdapterProps<NativeSelectFieldProps>

function SelectField(props: SelectFieldProps) {
  const { value, onChange, onBlur } = useField()
  return (
    <FieldShell>
      <NativeSelect.Root>
        <NativeSelect.Field {...props} value={value ?? ''} onChange={e => onChange(e.target.value)} onBlur={onBlur} />
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </FieldShell>
  )
}

export type CheckboxFieldProps = AdapterProps<CheckboxRootProps, 'checked' | 'onCheckedChange'>

function CheckboxField(props: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <Checkbox.Root {...props} checked={Boolean(value)} onCheckedChange={e => onChange(Boolean(e.checked))} disabled={disabled}>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>{label}</Checkbox.Label>
    </Checkbox.Root>
  )
}

export const fields = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}
