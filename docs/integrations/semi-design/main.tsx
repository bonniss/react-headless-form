import '@douyinfe/semi-ui-19/dist/css/semi.min.css'
import { Button, LocaleProvider, Radio, RadioGroup } from '@douyinfe/semi-ui-19'
import enUS from '@douyinfe/semi-ui-19/lib/es/locale/source/en_US'
import jaJP from '@douyinfe/semi-ui-19/lib/es/locale/source/ja_JP'
import type { ReactNode } from 'react'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

// Semi's built-in texts follow the demo language
const Wrapper = ({ children, lang }: { children: ReactNode; lang: string }) => (
  <LocaleProvider locale={lang === 'ja' ? jaJP : enUS}>{children}</LocaleProvider>
)

// The demo stage around the form: header controls drawn with Semi Design
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ form, children }) => (
      <Button theme="solid" type="primary" htmlType="submit" form={form} size="small">
        {children}
      </Button>
    ),
    LanguageSwitch: ({ value, options, onChange }) => (
      <RadioGroup type="button" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(option => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </RadioGroup>
    ),
  },
  { Wrapper },
)
