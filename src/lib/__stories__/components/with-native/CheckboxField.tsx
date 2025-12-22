import { useField } from "@/components"
import { FunctionComponent } from "react"

interface CheckboxFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const CheckboxField: FunctionComponent<CheckboxFieldProps> = (props) => {
  const {
    fieldProps: { id, value, onChange, label, disabled, readOnly, visible },
  } = useField()

  if (!visible) return null

  return (
    <label id={id}>
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
      />
      {label}
    </label>
  )
}

export default CheckboxField
