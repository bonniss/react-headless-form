import type { FunctionComponent } from "react";
import { useField } from "../provider";
import type { RenderFn } from "@/types/render";

type InlineFieldProps = {}

const InlineField: FunctionComponent<InlineFieldProps> = () => {
  const { config, controller, ...fieldProps } = useField();

  return (config.render as RenderFn<"inline">)?.({ ...fieldProps });
};

export default InlineField;
