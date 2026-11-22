import 'primereact/resources/themes/lara-light-blue/theme.css'
import { PrimeReactProvider } from 'primereact/api'
import { Button } from 'primereact/button'
import { SelectButton } from 'primereact/selectbutton'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

// The demo stage around the form: header controls drawn with PrimeReact
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ form, children }) => (
      <Button type="submit" form={form} size="small">
        {children}
      </Button>
    ),
    LanguageSwitch: ({ value, options, onChange }) => (
      <SelectButton value={value} options={options} optionValue="value" allowEmpty={false} onChange={e => onChange(e.value)} />
    ),
  },
  { Wrapper: PrimeReactProvider },
)
