import { useField } from "@/components"
import { Form, Input } from "antd"
import { FunctionComponent } from "react"

interface InputFieldProps extends React.ComponentProps<typeof Input> {}

const InputField: FunctionComponent<InputFieldProps> = (props) => {
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
      required,
      readOnlyEmptyFallback,
    },
  } = useField()

  if (!visible) return null

  if (readOnly && !value && readOnlyEmptyFallback) {
    return <div id={id}>{readOnlyEmptyFallback}</div>
  }

  return (
    <Form.Item
      id={id}
      label={label}
      required={required}
      help={description}
      validateStatus={errorMessage ? "error" : undefined}
      extra={errorMessage}
    >
      <Input
        {...props}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        aria-required={required}
        aria-invalid={Boolean(errorMessage)}
      />
    </Form.Item>
  )
}

export default InputField
