import type { InputHTMLAttributes } from "react";
import { useField } from "react-headless-form";

export default function InputField(props: InputHTMLAttributes<HTMLInputElement>) {
  const { id, value, onChange, onBlur, ref, label, description, errorMessage, required, disabled, readOnly } =
    useField();
  return (
    <div>
      <label htmlFor={id}>
        {label}
        {required && " *"}
      </label>
      <input
        {...props}
        id={id}
        ref={ref}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        aria-required={required}
        aria-invalid={Boolean(errorMessage)}
      />
      {description && <div className="fieldDescription">{description}</div>}
      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </div>
  );
}
