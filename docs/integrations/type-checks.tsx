/**
 * Type-level checks: `props` in each library's config is typed by that
 * library's own component props. Every `@ts-expect-error` below must fail to
 * compile; `tsc -p integrations` (run by the docs build) reports an unused one.
 */
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
