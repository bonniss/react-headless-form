import { Button, ChakraProvider, defaultSystem, SegmentGroup } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

const Wrapper = ({ children }: { children: ReactNode }) => <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>

// The demo stage around the form: header controls drawn with Chakra UI
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ form, children }) => (
      <Button type="submit" form={form} size="xs">
        {children}
      </Button>
    ),
    LanguageSwitch: ({ value, options, onChange }) => (
      <SegmentGroup.Root size="xs" value={value} onValueChange={e => e.value && onChange(e.value)}>
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={options} />
      </SegmentGroup.Root>
    ),
  },
  { Wrapper },
)
