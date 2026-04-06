import { useField } from "react-headless-form";
import { FunctionComponent } from "react";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string }[];
}

const SelectField: FunctionComponent<SelectFieldProps> = ({
  options,
  ...props
}) => {
  const { id, value, onChange, label, disabled, ref } = useField();

  return (
    <div id={id}>
      <span>{label}</span>
      <select
        {...props}
        ref={ref}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
