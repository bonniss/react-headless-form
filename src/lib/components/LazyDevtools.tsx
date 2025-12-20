import { FunctionComponent, lazy, Suspense } from 'react'
import { useFormContext } from 'react-hook-form'
import { DevToolConfig } from '../types'
import { useDynamicFormContext } from './providers'

interface LazyDevtoolsProps {
  config: DevToolConfig
}

const DevTools = lazy(() => import('@hookform/devtools').then((mod) => ({ default: mod.DevTool })))

const LazyDevtools: FunctionComponent<LazyDevtoolsProps> = ({ config }) => {
  const { devToolConfig: devToolConfigFromContext = {} } = useDynamicFormContext()
  const { control } = useFormContext()
  const cfg = { ...devToolConfigFromContext, ...config }

  return (
    cfg.enabled && (
      <Suspense fallback={'...'}>
        <DevTools {...cfg?.devToolProps} control={control} />
      </Suspense>
    )
  )
}

export default LazyDevtools
