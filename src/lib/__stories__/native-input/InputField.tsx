import { useField } from "@/components"
import { FunctionComponent } from "react"

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputField: FunctionComponent<InputFieldProps> = (props) => {
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

  console.info({ visible, readOnly, readOnlyEmptyFallback })

  if (!visible) return null
  if (readOnly && readOnlyEmptyFallback) {
    return <div id={id}>{readOnlyEmptyFallback}</div>
  }

  return (
    <div id={id}>
      <input
        {...props}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={label}
        aria-required={required}
        aria-invalid={Boolean(errorMessage)}
      />
      {description && <div className="field-description">{description}</div>}
      {errorMessage && <div className="field-error">{errorMessage}</div>}
    </div>
  )
}

export default InputField
