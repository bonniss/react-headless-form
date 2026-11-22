/**
 * Type-level checks: `props` in each library's config is typed by that
 * library's own component props. Every `@ts-expect-error` below must fail to
 * compile; `tsc -p integrations` (run by the docs build) reports an unused one.
 */
import { defineConfig as arcoConfig } from './arco-design/form'
import { defineConfig as chakraConfig } from './chakra-ui/form'
import { defineConfig as primeConfig } from './prime-react/form'
import { defineConfig as rnwConfig } from './react-native-web/form'
import { defineConfig as semiConfig } from './semi-design/form'
import { defineConfig as tdesignConfig } from './tdesign/form'
import { defineConfig as animalIslandConfig } from './animal-island/form'
import { defineConfig as antdConfig } from './antd/form'
import { defineConfig as mantineConfig } from './mantine/form'
import { defineConfig as muiConfig } from './mui/form'
import { defineConfig as shadcnConfig } from './shadcn/form'

type Model = { email: string; role: string }

mantineConfig<{ email: string }>({
  // @ts-expect-error `value` is controlled by useField() (AdapterProps removes it)
  email: { type: 'text', props: { value: 'x' } },
})
mantineConfig<Model>({
  email: { type: 'text', props: { leftSection: '@', description: 'Mantine TextInput props' } },
  // @ts-expect-error `options` is not a Mantine Select prop (Mantine uses `data`)
  role: { type: 'select', props: { options: [] } },
})

antdConfig<Model>({
  email: { type: 'text', props: { prefix: '@', allowClear: true } },
  // @ts-expect-error antd Select `mode` is 'multiple' | 'tags'
  role: { type: 'select', props: { mode: 'single' } },
})

muiConfig<Model>({
  email: { type: 'text', props: { helperText: 'MUI TextField props', variant: 'filled' } },
  // @ts-expect-error MUI `size` is 'small' | 'medium'
  role: { type: 'select', props: { size: 'xs' } },
})

shadcnConfig<Model>({
  email: { type: 'text', props: { autoComplete: 'email', inputMode: 'email' } },
  // @ts-expect-error `inputMode` only takes the HTML input modes
  role: { type: 'text', props: { inputMode: 'phone' } },
})

animalIslandConfig<Model>({
  email: { type: 'text', props: { prefix: '@', allowClear: true } },
  // @ts-expect-error animal-island-ui options use `key`, not `value`
  role: { type: 'select', props: { options: [{ value: 'a', label: 'A' }] } },
})

// A prop the adapter sets itself (AdapterProps' second argument) is rejected too
type Email = { email: string }
// @ts-expect-error Chakra: `value` comes from useField()
chakraConfig<Email>({ email: { type: 'text', props: { value: 'x' } } })
// @ts-expect-error PrimeReact: the adapter sets `invalid` from the error
primeConfig<Email>({ email: { type: 'text', props: { invalid: true } } })
// @ts-expect-error Arco: the adapter sets `status` from the error
arcoConfig<Email>({ email: { type: 'text', props: { status: 'error' } } })
// @ts-expect-error Semi: the adapter sets `validateStatus` from the error
semiConfig<Email>({ email: { type: 'text', props: { validateStatus: 'error' } } })
// @ts-expect-error TDesign: its Input has no `type="email"`
tdesignConfig<Email>({ email: { type: 'text', props: { type: 'email' } } })
// @ts-expect-error React Native: the adapter sets `onChangeText`
rnwConfig<Email>({ email: { type: 'text', props: { onChangeText: () => {} } } })
