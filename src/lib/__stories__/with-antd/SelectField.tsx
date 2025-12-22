import { useField } from "@/components"
import { Form, Select } from "antd"
import { FunctionComponent } from "react"

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  options: SelectOption[]
  allowClear?: boolean
}

const SelectField: FunctionComponent<SelectFieldProps> = ({
  options,
  allowClear = false,
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
      required,
      visible,
    },
  } = useField()

  if (!visible) return null

  return (
    <Form.Item
      id={id}
      label={label}
      required={required}
      help={description}
      validateStatus={errorMessage ? "error" : undefined}
      extra={errorMessage}
    >
      <Select
        value={value}
        onChange={(val) => onChange?.(val)}
        options={options}
        disabled={disabled}
        allowClear={allowClear}
        style={{ width: "100%" }}
      />
    </Form.Item>
  )
}

export default SelectField
