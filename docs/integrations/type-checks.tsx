/**
 * Type-level checks: `props` in each library's config is typed by that
 * library's own component props. Every `@ts-expect-error` below must fail to
 * compile; `tsc -p integrations` (run by the docs build) reports an unused one.
 */
import { fields as animalIsland, shells as animalIslandShells } from './animal-island/fields'
import { fields as antd, shells as antdShells } from './antd/fields'
import { fields as mantine, shells as mantineShells } from './mantine/fields'
import { fields as mui, shells as muiShells } from './mui/fields'
import { setupDemo } from './shared/setup'
import { fields as shadcn, shells as shadcnShells } from './shadcn/fields'

type Model = { email: string; role: string }

const [, mantineConfig] = setupDemo(mantine, mantineShells)
mantineConfig<Model>({
  email: { type: 'text', props: { leftSection: '@', description: 'Mantine TextInput props' } },
  // @ts-expect-error `options` is not a Mantine Select prop (Mantine uses `data`)
  role: { type: 'select', props: { options: [] } },
})

const [, antdConfig] = setupDemo(antd, antdShells)
antdConfig<Model>({
  email: { type: 'text', props: { prefix: '@', allowClear: true } },
  // @ts-expect-error antd Select `mode` is 'multiple' | 'tags'
  role: { type: 'select', props: { mode: 'single' } },
})

const [, muiConfig] = setupDemo(mui, muiShells)
muiConfig<Model>({
  email: { type: 'text', props: { helperText: 'MUI TextField props', variant: 'filled' } },
  // @ts-expect-error MUI `size` is 'small' | 'medium'
  role: { type: 'select', props: { size: 'xs' } },
})

const [, shadcnConfig] = setupDemo(shadcn, shadcnShells)
shadcnConfig<Model>({
  email: { type: 'text', props: { autoComplete: 'email', inputMode: 'email' } },
  // @ts-expect-error `inputMode` only takes the HTML input modes
  role: { type: 'text', props: { inputMode: 'phone' } },
})

const [, animalIslandConfig] = setupDemo(animalIsland, animalIslandShells)
animalIslandConfig<Model>({
  email: { type: 'text', props: { prefix: '@', allowClear: true } },
  // @ts-expect-error animal-island-ui options use `key`, not `value`
  role: { type: 'select', props: { options: [{ value: 'a', label: 'A' }] } },
})
