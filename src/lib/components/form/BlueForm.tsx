import { forwardRef, useImperativeHandle } from "react"

import {
  FieldValues,
  FormProvider,
  UseFormProps,
  useForm,
} from "react-hook-form"

import { BlueFormRef } from "@/types/form"
import type { BlueFormProps, ComponentMap } from "../../types"
import { BlueFormInternalProvider } from "./internal/BlueFormInternalProvider"
import { BlueFormContent } from "./internal/BlueFormContent"

export function BlueFormInner<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
>(
  blueFormProps: BlueFormProps<TModel, TComponentMap>,
  ref: React.Ref<BlueFormRef<TModel>>
) {
  const { defaultValues, formProps } = blueFormProps
  const form = useForm<TModel>({
    mode: "onTouched",
    reValidateMode: "onChange",
    ...formProps,
    defaultValues,
  } as UseFormProps<TModel>)
  useImperativeHandle(ref, () => form, [form])

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
