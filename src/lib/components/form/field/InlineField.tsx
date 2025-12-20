import { FunctionComponent } from 'react'
import { useField } from '../provider'

interface InlineFieldProps {}

const InlineField: FunctionComponent<InlineFieldProps> = () => {
  const { fieldProps, config } = useField()

  return config.render?.({ fieldProps })
}

export default InlineField
