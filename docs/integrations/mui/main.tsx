import { Button, CssBaseline, ToggleButton, ToggleButtonGroup } from '@mui/material'
import type { ReactNode } from 'react'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

const Wrapper = ({ children }: { children: ReactNode }) => (
  <>
    <CssBaseline />
    {children}
  </>
)

// The demo stage around the form: header controls drawn with Material UI
mountDemo(
  { Form, buildConfig, defaultValues },
  {
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
  },
  { Wrapper },
)
