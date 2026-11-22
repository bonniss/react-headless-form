import type { TextareaHTMLAttributes } from 'react'
import { useField } from 'react-headless-form'

export default function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { value, onChange, onBlur, ref, label, errorMessage, required, disabled, readOnly } = useField()
  return (
    <div>
      {/* the input inside its label: no id needed, so several forms can share field names */}
      <label>
        {label}
        {required && ' *'}
        <textarea
          {...props}
          ref={ref}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={Boolean(errorMessage)}
        />
      </label>
      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </div>
  )
}
