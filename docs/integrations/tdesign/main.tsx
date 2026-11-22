import 'tdesign-react/es/style/index.css'
import type { ReactNode } from 'react'
import { Button, ConfigProvider, Radio } from 'tdesign-react'
import enUS from 'tdesign-react/es/locale/en_US'
import jaJP from 'tdesign-react/es/locale/ja_JP'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

// TDesign's built-in texts (placeholders, empty states) follow the demo language
const Wrapper = ({ children, lang }: { children: ReactNode; lang: string }) => (
  <ConfigProvider globalConfig={lang === 'ja' ? jaJP : enUS}>{children}</ConfigProvider>
)

// The demo stage around the form: header controls drawn with TDesign
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ form, children }) => (
      <Button theme="primary" type="submit" form={form} size="small">
        {children}
      </Button>
    ),
    LanguageSwitch: ({ value, options, onChange }) => (
      <Radio.Group variant="default-filled" size="small" value={value} onChange={next => onChange(String(next))}>
        {options.map(option => (
          <Radio.Button key={option.value} value={option.value}>
            {option.label}
          </Radio.Button>
        ))}
      </Radio.Group>
    ),
  },
  { Wrapper },
)
