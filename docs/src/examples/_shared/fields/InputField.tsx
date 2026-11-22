import type { InputHTMLAttributes } from 'react'
import { useField } from 'react-headless-form'

export default function InputField(props: InputHTMLAttributes<HTMLInputElement>) {
  const { value, onChange, onBlur, ref, label, description, errorMessage, required, disabled, readOnly } = useField()
  return (
    <div>
      {/* the input inside its label: no id needed, so several forms can share field names */}
      <label>
        {label}
        {required && ' *'}
        <input
          {...props}
          ref={ref}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          aria-required={required}
          aria-invalid={Boolean(errorMessage)}
        />
      </label>
      {description && <div className="fieldDescription">{description}</div>}
      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </div>
  )
}
