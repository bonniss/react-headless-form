import '@arco-design/web-react/dist/css/arco.css'
import { Button, ConfigProvider, Radio } from '@arco-design/web-react'
import enUS from '@arco-design/web-react/es/locale/en-US'
import jaJP from '@arco-design/web-react/es/locale/ja-JP'
import type { ReactNode } from 'react'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

// Arco's built-in texts follow the demo language
const Wrapper = ({ children, lang }: { children: ReactNode; lang: string }) => (
  <ConfigProvider locale={lang === 'ja' ? jaJP : enUS}>{children}</ConfigProvider>
)

// The demo stage around the form: header controls drawn with Arco Design
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ form, children }) => (
      <Button type="primary" htmlType="submit" form={form} size="small">
        {children}
      </Button>
    ),
    LanguageSwitch: ({ value, options, onChange }) => (
      <Radio.Group type="button" size="small" value={value} options={options} onChange={onChange} />
    ),
  },
  { Wrapper },
)
