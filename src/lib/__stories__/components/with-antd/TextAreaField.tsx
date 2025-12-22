import { useField } from "@/components"
import { Form, Input } from "antd"
import { FunctionComponent } from "react"

const { TextArea } = Input

interface TextAreaFieldProps extends React.ComponentProps<typeof TextArea> {}

const TextAreaField: FunctionComponent<TextAreaFieldProps> = (props) => {
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
      <TextArea
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

export default TextAreaField
