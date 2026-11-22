import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

// The demo stage around the form: header controls drawn with React-Bootstrap
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ form, children }) => (
      <Button type="submit" form={form} size="sm">
        {children}
      </Button>
    ),
    LanguageSwitch: ({ value, options, onChange }) => (
      <ToggleButtonGroup type="radio" name="lang" size="sm" value={value} onChange={onChange}>
        {options.map(option => (
          <ToggleButton key={option.value} id={`lang-${option.value}`} value={option.value} variant="outline-primary">
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    ),
  },
)
