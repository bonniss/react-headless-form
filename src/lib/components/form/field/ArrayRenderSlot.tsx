import { FormFieldConfig } from "@/types";
import { FunctionComponent } from "react";
import { useArrayField } from "../provider";

interface ArrayRenderSlotProps {
  render?: FormFieldConfig<any, any>["render"];
}

const ArrayRenderSlot: FunctionComponent<ArrayRenderSlotProps> = ({
  render,
}) => {
  const { fieldProps, renderItems } = useArrayField();
  const children = renderItems();
  return render?.({ ...fieldProps, children }) ?? null;
};

export default ArrayRenderSlot;
