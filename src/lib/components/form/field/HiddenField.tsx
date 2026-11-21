/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { FunctionComponent } from "react"

import { useField } from "../provider"

type HiddenFieldProps = {}

const HiddenField: FunctionComponent<HiddenFieldProps> = () => {
  useField()
  return null
}

export default HiddenField
