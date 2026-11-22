import { Button, ConfigProvider, Segmented } from 'antd'
import type { ReactNode } from 'react'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

// antd inserts a space between two CJK characters in buttons ("登 録"); turn it off
const Wrapper = ({ children }: { children: ReactNode }) => (
  <ConfigProvider button={{ autoInsertSpace: false }}>{children}</ConfigProvider>
)

// The demo stage around the form: header controls drawn with Ant Design
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ form, children }) => (
      <Button type="primary" htmlType="submit" form={form} size="small">
        {children}
      </Button>
    ),
    LanguageSwitch: ({ value, options, onChange }) => (
      <Segmented size="small" value={value} options={options} onChange={next => onChange(String(next))} />
    ),
  },
  { Wrapper },
)
