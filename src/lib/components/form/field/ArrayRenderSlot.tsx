import { FormFieldConfig } from "@/types"
import { Fragment, FunctionComponent } from "react"
import { useArrayField } from "../provider"

interface ArrayRenderSlotProps {
  render?: FormFieldConfig<any, any>["render"]
}

const ArrayRenderSlot: FunctionComponent<ArrayRenderSlotProps> = ({
  render,
}) => {
  const { fieldProps, controller, renderItem } = useArrayField()

  const children = controller.fields.map((item, index) => {
    return <Fragment key={item.id ?? index}>{renderItem(item, index)}</Fragment>
  })

  const content = render?.({ fieldProps, children })
  return content
}

export default ArrayRenderSlot
