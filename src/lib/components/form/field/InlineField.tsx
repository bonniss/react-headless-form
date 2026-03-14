import { FunctionComponent } from "react";
import { useField } from "../provider";
import { RenderFn } from "@/types/render";

interface InlineFieldProps {}

const InlineField: FunctionComponent<InlineFieldProps> = () => {
  const { config, controller, ...fieldProps } = useField();

  return (config.render as RenderFn<"inline">)?.({ ...fieldProps });
};

export default InlineField;
