import { useField } from "@/components"
import { FunctionComponent } from "react"

interface TextAreaFieldProps
  extends React.InputHTMLAttributes<HTMLTextAreaElement> {}

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
    <div id={id}>
      <span style={{ marginRight: 10 }}>{label}</span>
      <textarea
        {...props}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={props.placeholder ?? label}
        aria-required={required}
        aria-invalid={Boolean(errorMessage)}
      />
      {description && <div className="field-description">{description}</div>}
      {errorMessage && <div className="field-error">{errorMessage}</div>}
    </div>
  )
}

export default TextAreaField
