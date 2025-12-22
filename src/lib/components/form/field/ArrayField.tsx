import { ComponentMap, FieldArrayProps } from "@/types"
import { FieldValues } from "react-hook-form"
import useArrayCollapseMap from "../hook/use-array-collapse-map"
import BlueFormEngine from "../internal/BlueFormEngine"
import { useArrayField } from "../provider"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ArrayFieldProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
> extends FieldArrayProps<TModel, TComponentMap> {}

function ArrayField<
  TModel extends FieldValues,
  TComponentMap extends Record<string, any>
>({ config }: ArrayFieldProps<TModel, TComponentMap>) {
  const { controller, fieldProps } = useArrayField()
  const { fields } = controller!
  const { path } = fieldProps!
  const { collapseMap } = useArrayCollapseMap(fields)
  const shouldExpandAll = Object.values(collapseMap).every(Boolean)
  const children = fields.map((field, index) => (
    <BlueFormEngine
      key={field.id ?? index}
      config={config as any}
      namespace={`${path}.${index}`} />
  ))

  return null
}

export default ArrayField
