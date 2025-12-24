/* eslint-disable @typescript-eslint/no-empty-object-type */
import { FunctionComponent, useEffect } from "react"

import { useFormContext } from "react-hook-form"
import { useField } from "../provider"

interface HiddenFieldProps {}

const HiddenField: FunctionComponent<HiddenFieldProps> = () => {
  const {
    fieldProps: { value, path },
  } = useField()
  const { setValue } = useFormContext()

  // biome-ignore lint/correctness/useExhaustiveDependencies: on component mount
  useEffect(() => {
    if (path) {
      setValue(path, value, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      })
    }
  }, [path, value])

  return null
}

export default HiddenField
