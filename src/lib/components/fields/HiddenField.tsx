/* eslint-disable @typescript-eslint/no-empty-object-type */
import { FunctionComponent, useEffect } from 'react'

import { useFormContext } from 'react-hook-form'
import { useField } from '../providers'

interface HiddenFieldProps {}

const HiddenField: FunctionComponent<HiddenFieldProps> = () => {
  const { fieldProps } = useField()
  const { register, setValue } = useFormContext()
  const { value, path } = fieldProps

  useEffect(() => {
    if (path) {
      register(path)
      setValue(path, value, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default HiddenField
