import { Checkbox, FormControlLabel, MenuItem, TextField as MuiTextField } from '@mui/material'
import { type AdapterProps, useField } from 'react-headless-form'
import type { CheckboxProps, TextFieldProps as MuiTextFieldProps } from '@mui/material'

/** Props shared by every MUI TextField-based adapter. */
// AdapterProps: the library's own props minus what useField() controls (value,
// onChange, label, disabled, ...) and `Extra`, the props this adapter also sets.
// So `props` in the config is typed (and autocompleted) as Material UI's props.
type Extra = 'error' | 'inputRef'

export type TextFieldProps = AdapterProps<MuiTextFieldProps, Extra>

/** Merges the config's `slotProps` with the read-only flag from useField(). */
function Field({ slotProps, helperText, ...props }: TextFieldProps) {
  const { value, onChange, onBlur, ref, label, description, errorMessage, required, disabled, readOnly } = useField()
  return (
    <MuiTextField
      fullWidth
      size="small"
      {...props}
      inputRef={ref}
      label={label}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      error={Boolean(errorMessage)}
      helperText={errorMessage ?? description ?? helperText} // the field's description, translated
      required={required}
      disabled={disabled}
      slotProps={{ ...slotProps, htmlInput: { ...(slotProps?.htmlInput as object), readOnly } }}
    />
  )
}

function TextField(props: TextFieldProps) {
  return <Field {...props} />
}


/** The options are `MenuItem` children from the config, as in MUI itself. */
export type SelectFieldProps = Omit<TextFieldProps, 'select'>

function SelectField(props: SelectFieldProps) {
  return <Field {...props} select />
}

export type CheckboxFieldProps = AdapterProps<CheckboxProps, 'checked'>

function CheckboxField(props: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <FormControlLabel
      label={label}
      disabled={disabled}
      control={<Checkbox {...props} checked={Boolean(value)} onChange={e => onChange(e.target.checked)} />}
    />
  )
}

export const fields = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}
