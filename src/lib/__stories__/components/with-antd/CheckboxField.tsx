import { Checkbox } from "antd"
import { FunctionComponent } from "react"
import { useField } from "@/components"

interface CheckboxFieldProps {
  indeterminate?: boolean
}

const CheckboxField: FunctionComponent<CheckboxFieldProps> = ({
  indeterminate,
}) => {
  const {
    fieldProps: {
      id,
      value,
      onChange,
      label,
      description,
      errorMessage,
      disabled,
      readOnly,
      visible,
    },
  } = useField()

  if (!visible) return null

  return (
    <div id={id}>
      <Checkbox
        checked={Boolean(value)}
        indeterminate={indeterminate}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      >
        {label}
      </Checkbox>

      {description && <div className="field-description">{description}</div>}
      {errorMessage && <div className="field-error">{errorMessage}</div>}
    </div>
  )
}

export default CheckboxField
