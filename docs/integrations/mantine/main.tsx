import '@mantine/core/styles.css'
import { Button, MantineProvider, SegmentedControl } from '@mantine/core'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

// The demo stage around the form: header controls drawn with Mantine
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ form, children }) => (
      <Button type="submit" form={form} size="xs">
        {children}
      </Button>
    ),
    LanguageSwitch: ({ value, options, onChange }) => (
      <SegmentedControl size="xs" value={value} data={options} onChange={onChange} />
    ),
  },
  { Wrapper: MantineProvider },
)
