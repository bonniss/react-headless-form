import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField as MuiTextField,
} from '@mui/material'
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
  Root: ({ children, onSubmit }) => {
    const t = useT()
    return (
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {children}
          <Button type="submit" variant="contained">
            {t('action.save')}
          </Button>
        </Stack>
      </form>
    )
  },
  Section: ({ title, children }) => (
    <Card variant="outlined">
      <CardHeader title={title} titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={2}>{children}</Stack>
      </CardContent>
    </Card>
  ),
  AddressList: () => {
    const t = useT()
    const { label, items, renderItem, append, remove } = useArrayField()
    return (
      <Card variant="outlined">
        <CardHeader title={label} titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Stack spacing={2}>
            {items.map((item, index) => (
              <Stack key={item.id} direction="row" spacing={1} alignItems="center">
                {renderItem(item, index)}
                <Button color="error" onClick={() => remove(index)}>
                  {t('action.remove')}
                </Button>
              </Stack>
            ))}
            <Button variant="outlined" onClick={() => append({ street: '', city: '' })}>
              {t('action.add')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    )
  },
}
