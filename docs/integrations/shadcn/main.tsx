import './tailwind.css'
import { Button } from './ui'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

// The demo stage around the form: header controls drawn with shadcn/ui
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ form, children }) => (
      <Button type="submit" form={form} className="h-8 px-3">
        {children}
      </Button>
    ),
    LanguageSwitch: ({ value, options, onChange }) => (
      <div className="inline-flex gap-1 rounded-lg border border-zinc-200 bg-white p-1">
        {options.map(option => (
          <Button
            key={option.value}
            type="button"
            variant={option.value === value ? 'default' : 'outline'}
            className="h-7 px-3"
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
