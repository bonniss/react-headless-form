import 'animal-island-ui/style'
import { Button } from 'animal-island-ui'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

// The demo stage around the form: header controls drawn with animal-island-ui
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ form, children }) => (
      <Button type="primary" htmlType="submit" form={form} size="small">
        {children}
      </Button>
    ),
    LanguageSwitch: ({ value, options, onChange }) => (
      <div style={{ display: 'flex', gap: 6 }}>
        {options.map(option => (
          <Button
            key={option.value}
            size="small"
            type={option.value === value ? 'primary' : 'default'}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    ),
  },
)
