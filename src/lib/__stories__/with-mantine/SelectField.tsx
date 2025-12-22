import { useField } from "@/components"
import { Select, SelectProps } from "@mantine/core"
import { FunctionComponent } from "react"

interface SelectFieldProps extends SelectProps {
  data: { value: string; label: string }[]
  clearable?: boolean
}

const SelectField: FunctionComponent<SelectFieldProps> = ({
  data,
  clearable = false,
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
    <Select
      {...props}
      id={id}
      data={data}
      value={value ?? null}
      onChange={(val) => onChange?.(val)}
      label={label}
      description={description}
      error={errorMessage}
      disabled={disabled}
      readOnly={readOnly}
      clearable={clearable}
    />
  )
}

export default SelectField
