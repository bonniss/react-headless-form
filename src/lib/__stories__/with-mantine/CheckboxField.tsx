import { useField } from "@/components"
import { Checkbox, CheckboxProps } from "@mantine/core"
import { FunctionComponent } from "react"

interface CheckboxFieldProps extends CheckboxProps {
  labelPosition?: "left" | "right"
}

const CheckboxField: FunctionComponent<CheckboxFieldProps> = ({
  labelPosition = "right",
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
    config: { props },
  } = useField()

  if (!visible) return null

  return (
    <Checkbox
      {...props}
      id={id}
      checked={Boolean(value)}
      onChange={(e) => onChange?.(e.currentTarget.checked)}
      label={label}
      description={description}
      error={errorMessage}
      disabled={disabled}
      readOnly={readOnly}
      labelPosition={labelPosition}
    />
  )
}

export default CheckboxField
