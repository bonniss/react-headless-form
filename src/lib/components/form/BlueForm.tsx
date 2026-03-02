import {
  type FieldValues,
  type UseFormProps,
  FormProvider,
  useForm,
} from "react-hook-form"

import type { BlueFormRef } from "@/types/form"
import { forwardRef, useImperativeHandle } from "react"
import type { BlueFormProps, ComponentMap } from "../../types"
import { BlueFormContent } from "./internal/BlueFormContent"
import { BlueFormInternalProvider } from "./internal/BlueFormInternalProvider"

function hasRulesInConfig(config: Record<string, any>): boolean {
  return Object.values(config).some((field) => {
    if (!field) return false
    if (field.rules && Object.keys(field.rules).length > 0) return true
    // recurse vào section/group
    if (field.props?.config) return hasRulesInConfig(field.props.config)
    return false
  })
}

export function BlueFormInner<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
>(
  blueFormProps: BlueFormProps<TModel, TComponentMap>,
  ref: React.Ref<BlueFormRef<TModel>>,
) {
  const { defaultValues, formProps, config } = blueFormProps
  const form = useForm<TModel>({
    mode: "onTouched",
    reValidateMode: "onChange",
    ...formProps,
    defaultValues,
  } as UseFormProps<TModel>)
  useImperativeHandle(ref, () => form, [form])

  if (formProps?.resolver && hasRulesInConfig(config as Record<string, any>)) {
    console.warn(
      "[react-headless-form] `rules` defined in field config are automatically disabled when `formProps.resolver` is provided. " +
        "Define all validation in your schema instead.",
    )
  }

  return (
    <FormProvider {...form}>
      <BlueFormInternalProvider defaultValue={blueFormProps}>
        <BlueFormContent<TModel, TComponentMap> />
      </BlueFormInternalProvider>
    </FormProvider>
  )
}

const BlueForm = forwardRef(BlueFormInner)

export default BlueForm
