import { Box, Button, Card, CardContent, CardHeader, Checkbox, FormControlLabel, MenuItem, Stack, TextField as MuiTextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
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

/** Props shared by every MUI TextField-based adapter. */
function useTextFieldProps() {
  const { value, onChange, onBlur, ref, label, errorMessage, required, disabled, readOnly } = useField()
  return {
    inputRef: ref,
    label,
    value: value ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    onBlur,
    error: Boolean(errorMessage),
    helperText: errorMessage,
    required,
    disabled,
    slotProps: { htmlInput: { readOnly } },
    fullWidth: true,
    size: 'small' as const,
  }
}

function TextField({ type, placeholder }: TextFieldProps) {
  return <MuiTextField {...useTextFieldProps()} type={type} placeholder={placeholder} />
}

function LongTextField({ rows }: LongTextFieldProps) {
  return <MuiTextField {...useTextFieldProps()} multiline minRows={rows} />
}

function SelectField({ options }: SelectFieldProps) {
  return (
    <MuiTextField {...useTextFieldProps()} select>
      {options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </MuiTextField>
  )
}

function CheckboxField(_: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <FormControlLabel
      label={label}
      disabled={disabled}
      control={<Checkbox checked={Boolean(value)} onChange={e => onChange(e.target.checked)} />}
    />
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
