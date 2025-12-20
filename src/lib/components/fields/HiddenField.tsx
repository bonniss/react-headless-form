/* eslint-disable @typescript-eslint/no-empty-object-type */
import { FunctionComponent, useEffect } from 'react'

import { useFormContext } from 'react-hook-form'
import { useField } from '../providers'

interface HiddenFieldProps {}

const HiddenField: FunctionComponent<HiddenFieldProps> = () => {
  const { fieldProps } = useField()
  const { register, setValue } = useFormContext()
  const { value, name } = fieldProps

  useEffect(() => {
    if (name) {
      register(name)
      setValue(name, value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default HiddenField
