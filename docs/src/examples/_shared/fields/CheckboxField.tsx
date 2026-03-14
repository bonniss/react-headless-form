import { useField } from "react-headless-form";
import { FunctionComponent } from "react";

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const CheckboxField: FunctionComponent<CheckboxFieldProps> = (props) => {
  const {
    id,
    value,
    onChange,
    label,
    description,
    errorMessage,
    disabled,
    readOnly,
    visible,
  } = useField();

  if (!visible) return null;

  return (
    <div id={id}>
      <label>
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
      {description && <div className="fieldDescription">{description}</div>}
      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </div>
  );
};

export default CheckboxField;
