import { useField } from "@/components"
import { Textarea, TextareaProps } from "@mantine/core"
import { FunctionComponent } from "react"

interface TextAreaFieldProps extends TextareaProps {}

const TextAreaField: FunctionComponent<TextAreaFieldProps> = (props) => {
  const {
    fieldProps: {
      id,
      value,
      onChange,
      errorMessage,
      label,
      description,
      required,
      disabled,
      readOnly,
      readOnlyEmptyFallback,
      visible,
    },
  } = useField()

  if (!visible) return null
  if (readOnly && readOnlyEmptyFallback) {
    return <div id={id}>{readOnlyEmptyFallback}</div>
  }

  return (
    <Textarea
      {...props}
      id={id}
      label={label}
      description={description}
      error={errorMessage}
      withAsterisk={required}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={props.placeholder ?? label}
      aria-required={required}
      aria-invalid={Boolean(errorMessage)}
    />
  )
}

export default TextAreaField
