import { Box, Button, Card, CardContent, CardHeader, Checkbox, FormControlLabel, MenuItem, Stack, TextField as MuiTextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useArrayField, useField } from 'react-headless-form'
import type { CheckboxProps, TextFieldProps as MuiTextFieldProps } from '@mui/material'
import type { Shells } from '../shared/types'
import { useT } from '../shared/i18n'

/** Props shared by every MUI TextField-based adapter. */
// Each adapter takes the library's own props, minus what useField() controls,
// so `props` in the config is typed (and autocompleted) as Material UI's props.
type Controlled = 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'error' | 'label' | 'required' | 'disabled' | 'inputRef'

export type TextFieldProps = Omit<MuiTextFieldProps, Controlled>

/** Merges the config's `slotProps` with the read-only flag from useField(). */
function Field({ slotProps, helperText, ...props }: TextFieldProps) {
  const { value, onChange, onBlur, ref, label, errorMessage, required, disabled, readOnly } = useField()
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
      helperText={errorMessage ?? helperText}
      required={required}
      disabled={disabled}
      slotProps={{ ...slotProps, htmlInput: { ...(slotProps?.htmlInput as object), readOnly } }}
    />
  )
}

function TextField(props: TextFieldProps) {
  return <Field {...props} />
}

export type LongTextFieldProps = Omit<TextFieldProps, 'multiline'>

function LongTextField(props: LongTextFieldProps) {
  return <Field {...props} multiline />
}

/** The options are `MenuItem` children from the config, as in MUI itself. */
export type SelectFieldProps = Omit<TextFieldProps, 'select'>

function SelectField(props: SelectFieldProps) {
  return <Field {...props} select />
}

export type CheckboxFieldProps = Omit<CheckboxProps, 'checked' | 'onChange' | 'disabled'>

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
  longText: LongTextField,
  select: SelectField,
  checkbox: CheckboxField,
}

export const shells: Shells = {
  Root: ({ id, children, onSubmit }) => {
    const t = useT()
    return (
      <form id={id} onSubmit={onSubmit} noValidate>
        <Stack spacing={2}>
          {children}
          <Button type="submit" variant="contained">
            {t('action.save')}
          </Button>
        </Stack>
      </form>
    )
  },
  SubmitButton: ({ form, children }) => (
    <Button type="submit" form={form} variant="contained" size="small">
      {children}
    </Button>
  ),
  LanguageSwitch: ({ value, options, onChange }) => (
    <ToggleButtonGroup size="small" exclusive value={value} onChange={(_, next) => next && onChange(next)}>
      {options.map(option => (
        <ToggleButton key={option.value} value={option.value}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  ),
  Section: ({ title, children }) => (
    <Card variant="outlined">
      <CardHeader title={title} titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={2}>{children}</Stack>
      </CardContent>
    </Card>
  ),
  LinesList: () => {
    const t = useT()
    const { label, items, renderItem, append, remove, errorMessage } = useArrayField()
    return (
      <Card variant="outlined">
        <CardHeader title={label} titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Stack spacing={2}>
            {items.map((item, index) => (
              <Card key={item.id} variant="outlined" sx={{ p: 1.5 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>{renderItem(item, index)}</Box>
                <Button color="error" size="small" onClick={() => remove(index)}>
                  {t('action.remove')}
                </Button>
              </Card>
            ))}
            {errorMessage && (
              <Typography color="error" variant="body2">
                {errorMessage}
              </Typography>
            )}
            <Button variant="outlined" onClick={() => append({ item: '', qty: '1', price: '' })}>
              {t('action.addLine')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    )
  },
}
