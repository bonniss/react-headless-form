import { useField } from "react-headless-form";
import { FunctionComponent } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputField: FunctionComponent<InputFieldProps> = (props) => {
  const {
    id,
    name,
    value,
    onChange,
    errorMessage,
    label,
    description,
    required,
    disabled,
    readOnly,
    visible,
    ref,
  } = useField();

  if (!visible) return null;

  return (
    <div id={id}>
      <span style={{ marginRight: 10 }}>
        {label} {required && "*"}
      </span>
      <input
        {...props}
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={props.placeholder ?? label}
        aria-required={required}
        aria-invalid={Boolean(errorMessage)}
      />
      {description && <div className="fieldDescription">{description}</div>}
      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </div>
  );
};

export default InputField;
