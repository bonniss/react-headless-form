import { FormFieldConfig } from "@/types";
import type { FunctionComponent } from "react";
import { useArrayField } from "../provider";
import type { RenderFn } from "@/types/render";

interface ArrayRenderSlotProps {
  render?: RenderFn<"array">;
}

const ArrayRenderSlot: FunctionComponent<ArrayRenderSlotProps> = ({
  render,
}) => {
  const field = useArrayField();
  const children = field.renderItems();
  return render?.({ ...field, children }) ?? null;
};

export default ArrayRenderSlot;
