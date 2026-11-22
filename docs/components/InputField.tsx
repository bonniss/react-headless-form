import type { InputHTMLAttributes } from "react";
import { useField } from "react-headless-form";

export default function InputField(props: InputHTMLAttributes<HTMLInputElement>) {
  const { value, onChange, onBlur, ref, label, description, errorMessage, required, disabled, readOnly } =
    useField();

  return (
    <div>
      {/* the input inside its label: associated without any id */}
      <label>
        {label} {required && "*"}
        <input
          {...props}
          ref={ref}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={Boolean(errorMessage)}
        />
      </label>
      {description && <div>{description}</div>}
      {errorMessage && <div role="alert">{errorMessage}</div>}
    </div>
  );
}
