import debounce from "just-debounce-it"
import { forwardRef, useEffect, useImperativeHandle } from "react"

import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
  UseFormProps,
  WatchObserver,
} from "react-hook-form"

import { BlueFormRef } from "@/types/form"
import type { BlueFormProps, ComponentMap, RootRenderer } from "../../types"
import FormEngine from "./BlueFormEngine"
import { useBlueFormProvider } from "./provider"

export function BlueFormInner<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
>(
  {
    fieldMapping: fieldMapping_,
    i18nConfig: i18nConfig_,
    renderRoot: renderRoot_,
    readOnlyEmptyFallback: readOnlyEmptyFallback_,

    config,
    defaultValues = {},
    formProps = {},
    readOnly: isFormReadOnly = false,
    changeDebounceDelay,
    children,

    onSubmit,
    onInit,
    onFieldChange,
    onFormChange,
    onSubmitSuccess,
    onSubmitError,
    ...props
  }: BlueFormProps<TModel, TComponentMap>,
  ref: React.Ref<BlueFormRef<TModel>>
) {
  const {
    renderRoot: _renderRoot,
    fieldMapping: _fieldMapping,
    i18nConfig: _i18nConfig,
    readOnlyEmptyFallback: _readOnlyEmptyFallback,
  } = useBlueFormProvider()

  const fieldMapping = fieldMapping_ ?? _fieldMapping
  const renderRoot = renderRoot_ ?? _renderRoot
  const i18nConfig = i18nConfig_ ?? _i18nConfig
  const readOnlyEmptyFallback = readOnlyEmptyFallback_ ?? _readOnlyEmptyFallback

  const form = useForm<TModel>({
    mode: "onTouched",
    reValidateMode: "onChange",
    ...formProps,
    defaultValues,
  } as UseFormProps<TModel>)

  const { handleSubmit, watch } = form

  useImperativeHandle(ref, () => form, [form])

  useEffect(() => {
    onInit?.(form)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    function watchFormChanges() {
      const observer: WatchObserver<TModel> = (
        value: Partial<TModel>,
        { name }
      ) => {
        if (name) onFieldChange?.(name as keyof TModel, value?.[name], form)
        onFormChange?.(value as TModel, form)
      }
      const sub = watch(
        changeDebounceDelay ? debounce(observer, changeDebounceDelay) : observer
      )
      return () => sub.unsubscribe()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [watch, changeDebounceDelay]
  )

  const submit = ((raw: TModel, e) => {
    onSubmit?.(raw, form, e)
    onSubmitSuccess?.(raw, form, e)
  }) as SubmitHandler<TModel>

  const formBody = (
    <>
      <FormEngine
        i18nConfig={i18nConfig}
        fieldMapping={fieldMapping}
        config={config}
        readOnly={isFormReadOnly}
        readOnlyEmptyFallback={readOnlyEmptyFallback}
      />
      {children}
    </>
  )

  const submitHandler = handleSubmit(submit, onSubmitError)

  const formRendererArgs = {
    formMethods: form,
    children: formBody,
    onSubmit: submitHandler,
    submit,
    ...props,
  }

  const renderedForm = renderRoot?.(
    // @ts-expect-error fix sau
    formRendererArgs
  )

  return <FormProvider {...form}>{renderedForm}</FormProvider>
}

const BlueForm = forwardRef(BlueFormInner)

export default BlueForm
