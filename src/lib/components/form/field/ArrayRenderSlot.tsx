import { FormFieldConfig } from "@/types";
import { FunctionComponent } from "react";
import { useArrayField } from "../provider";

interface ArrayRenderSlotProps {
  render?: FormFieldConfig<any, any>["render"];
}

const ArrayRenderSlot: FunctionComponent<ArrayRenderSlotProps> = ({
  render,
}) => {
  const field = useArrayField();
  const children = field.renderItems();
  return render?.({ ...field, children }) ?? null;
};

export default ArrayRenderSlot;
