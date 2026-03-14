import { FunctionComponent } from "react";
import { useField } from "../provider";

interface InlineFieldProps {}

const InlineField: FunctionComponent<InlineFieldProps> = () => {
  const { config, controller, ...fieldProps } = useField();

  return config.render?.({ ...fieldProps });
};

export default InlineField;
