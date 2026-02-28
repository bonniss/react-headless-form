/* eslint-disable @typescript-eslint/no-empty-object-type */
import { FunctionComponent } from "react"

import { useField } from "../provider"

interface HiddenFieldProps {}

const HiddenField: FunctionComponent<HiddenFieldProps> = () => {
  useField()
  return null
}

export default HiddenField
