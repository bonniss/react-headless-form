import type { DevTool as DevToolProps } from "@hookform/devtools"
import { ComponentProps, FunctionComponent, lazy, Suspense } from "react"
import { useFormContext } from "react-hook-form"

type DevToolConfig = {
  enabled?: boolean
  devToolProps?: Omit<
    NonNullable<ComponentProps<typeof DevToolProps>>,
    "control"
  >
}

interface LazyDevtoolsProps {
  config: DevToolConfig
}

const DevTools = lazy(() =>
  import("@hookform/devtools").then((mod) => ({ default: mod.DevTool }))
)

const LazyDevtools: FunctionComponent<LazyDevtoolsProps> = ({ config }) => {
  const { control } = useFormContext()
  const cfg = { ...config }

  return (
    cfg.enabled && (
      <Suspense fallback={"..."}>
        <DevTools {...cfg?.devToolProps} control={control} />
      </Suspense>
    )
  )
}

export default LazyDevtools
