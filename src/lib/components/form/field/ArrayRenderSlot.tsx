import { ComponentMap, FieldArrayProps } from "@/types"
import { FieldValues } from "react-hook-form"
import useArrayCollapseMap from "../hook/use-array-collapse-map"
import { useArrayField } from "../provider"
import BlueFormEngine from "../internal/BlueFormEngine";

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
  const { fields, append, remove, move, insert } = controller!

  // const {
  //   path,
  //   errorMessage,
  //   label,
  //   description,
  //   id,
  //   required,
  //   disabled,
  //   readOnly,
  //   readOnlyEmptyFallback,
  // } = fieldProps!
  // const hasEmpty = fields.length === 0
  // const { collapseMap, toggle, expandAll, collapseAll } =
  //   useArrayCollapseMap(fields)
  // const shouldExpandAll = Object.values(collapseMap).every(Boolean)

  // const children = fields.map((field, index) => {
  //   return (
  //     <BlueFormEngine
  //       key={field.id}
  //       config={config as any}
  //       namespace={`${path}.${index}`}
  //       readOnly={readOnly ?? disabled}
  //       readOnlyEmptyFallback={readOnlyEmptyFallback}
  //     />
  //   )
  // })

  // return (
  //   <FormItem
  //     id={id}
  //     {...wrapperProps}
  //     className={cx("py-2", wrapperProps?.className)}
  //     label={`${label}${fields.length > 0 ? ` (${fields.length})` : ""}`}
  //     extra={<FieldHint>{description}</FieldHint>}
  //     invalid={!!errorMessage}
  //     errorMessage={errorMessage}
  //     asterisk={required}
  //   >
  //     <div className="flex flex-col gap-4 mb-4">
  //       {fields.map((field, index) => (
  //         <Card
  //           key={field.id}
  //           header={{
  //             bordered: false,
  //             className: cx("pb-0", readOnly && "hidden"),
  //             content: (
  //               <div className="flex items-center justify-between">
  //                 <div className="flex items-center gap-2">
  //                   <span className="text-base">
  //                     #{index + 1}{" "}
  //                     <span className="opacity-20">({field.id.slice(-3)})</span>
  //                   </span>
  //                   {enableClone && (
  //                     <Button
  //                       variant="plain"
  //                       type="button"
  //                       size="xs"
  //                       icon={<IconDuplicate className="size-5" />}
  //                       onClick={() => insert(index + 1, { ...fields[index] })}
  //                     />
  //                   )}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <Button
  //                     variant="plain"
  //                     type="button"
  //                     size="xs"
  //                     icon={<IconMoveUp className="size-5" />}
  //                     disabled={index === 0}
  //                     onClick={() => move(index, index - 1)}
  //                   />
  //                   <Button
  //                     variant="plain"
  //                     type="button"
  //                     size="xs"
  //                     icon={<IconMoveDown className="size-5" />}
  //                     disabled={index === fields.length - 1}
  //                     onClick={() => move(index, index + 1)}
  //                   />
  //                   <Button
  //                     type="button"
  //                     variant="plain"
  //                     size="xs"
  //                     icon={
  //                       collapseMap[field.id] ? (
  //                         <IconExpand className="size-5" />
  //                       ) : (
  //                         <IconCollapse className="size-5" />
  //                       )
  //                     }
  //                     onClick={() => toggle(field.id)}
  //                   />
  //                   <Button
  //                     type="button"
  //                     variant="plain"
  //                     size="xs"
  //                     icon={<IconX className="size-5" />}
  //                     onClick={() => remove(index)}
  //                   />
  //                 </div>
  //               </div>
  //             ),
  //           }}
  //         >
  //           <div className={cx(collapseMap[field.id] && "hidden", className)}>
  //             <FormEngine
  //               config={config}
  //               namespace={`${path}.${index}`}
  //               readOnly={readOnly ?? disabled}
  //               readOnlyEmptyFallback={readOnlyEmptyFallback}
  //             />
  //           </div>
  //         </Card>
  //       ))}
  //     </div>
  //     {hasEmpty && <Empty />}
  //     <div
  //       className={cx(
  //         "flex items-center justify-end gap-2",
  //         readOnly && "hidden"
  //       )}
  //     >
  //       <Button
  //         type="button"
  //         variant="plain"
  //         className={cx(hasEmpty && "hidden")}
  //         size="sm"
  //         icon={
  //           shouldExpandAll ? (
  //             <IconExpand className="size-6" />
  //           ) : (
  //             <IconCollapse className="size-6" />
  //           )
  //         }
  //         onClick={() => (shouldExpandAll ? expandAll() : collapseAll())}
  //       />
  //       <ButtonCreate withTitle type="button" onClick={() => append({})} />
  //     </div>
  //   </FormItem>
  // )
}

export default ArrayField
