import { useField } from "@/components";
import { FunctionComponent } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputField: FunctionComponent<InputFieldProps> = (props) => {
  const {
    id,
    value,
    onChange,
    errorMessage,
    label,
    description,
    required,
    disabled,
    readOnly,
  } = useField();

  return (
    <div id={id}>
      <span style={{ marginRight: 10 }}>
        {label} {required && "*"}
      </span>
      <input
        {...props}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={props.placeholder ?? label}
        aria-required={required}
        aria-invalid={Boolean(errorMessage)}
      />
      {description && <div className="field-description">{description}</div>}
      {errorMessage && <div className="field-error">{errorMessage}</div>}
    </div>
  );
};

export default InputField;
