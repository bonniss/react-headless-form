import type { SelectHTMLAttributes } from "react";
import { useField } from "react-headless-form";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: { label: string; value: string }[];
};

export default function SelectField({ options, ...props }: SelectFieldProps) {
  const { id, value, onChange, ref, label, errorMessage, disabled } = useField();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select {...props} id={id} ref={ref} value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </div>
  );
}
