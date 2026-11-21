/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentMap, FieldResolvedProps, FormFieldConfig } from "@/types";

/** Props passed by `FieldNode` to the renderer of each core field type. */
export type FieldRendererProps = {
  field: FormFieldConfig<any, any>;
  resolved: FieldResolvedProps;
  componentProps: any;
  fieldMapping?: ComponentMap;
};
