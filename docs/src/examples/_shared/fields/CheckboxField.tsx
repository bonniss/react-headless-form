import type { InputHTMLAttributes } from "react";
import { useField } from "react-headless-form";

export default function CheckboxField(props: InputHTMLAttributes<HTMLInputElement>) {
  const { value, onChange, onBlur, ref, label, description, errorMessage, disabled, readOnly } = useField();
  return (
    <div>
      <label>
        <input
          {...props}
          ref={ref}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          disabled={disabled || readOnly}
        />{" "}
        {label}
      </label>
      {description && <div className="fieldDescription">{description}</div>}
      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </div>
  );
}
