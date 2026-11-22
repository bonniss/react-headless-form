import type { TextareaHTMLAttributes } from "react";
import { useField } from "react-headless-form";

export default function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { id, value, onChange, onBlur, ref, label, errorMessage, required, disabled, readOnly } = useField();
  return (
    <div>
      <label htmlFor={id}>
        {label}
        {required && " *"}
      </label>
      <textarea
        {...props}
        id={id}
        ref={ref}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={Boolean(errorMessage)}
      />
      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </div>
  );
}
