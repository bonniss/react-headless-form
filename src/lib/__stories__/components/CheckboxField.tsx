import { useField } from "@/components";
import { FunctionComponent } from "react";

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const CheckboxField: FunctionComponent<CheckboxFieldProps> = (props) => {
  const { id, value, onChange, label, disabled, readOnly } =
    useField();

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
  );
};

export default CheckboxField;
