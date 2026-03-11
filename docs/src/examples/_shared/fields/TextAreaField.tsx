import { useField } from "react-headless-form";
import { FunctionComponent } from "react";

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextAreaField: FunctionComponent<TextAreaFieldProps> = (props) => {
  const {
    fieldProps: {
      id,
      value,
      onChange,
      errorMessage,
      label,
      description,
      required,
      disabled,
      readOnly,
      visible,
    },
  } = useField();

  if (!visible) return null;

  return (
    <div id={id}>
      <span style={{ marginRight: 10 }}>{label}</span>
      <textarea
        {...props}
        value={value}
        onChange={onChange}
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

export default TextAreaField;
