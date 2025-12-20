import debounce from 'just-debounce-it'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { FieldValues, FormProvider, SubmitHandler, useForm, UseFormProps, WatchObserver } from 'react-hook-form'

import type { ComponentMap, DynamicFormProps, RootRenderer } from '../types'
import { DynamicFormRef } from '../types/form'
import FormEngine from './FormEngine'
import LazyDevtools from './LazyDevtools'
import { useDynamicFormContext } from './providers'

const defaultRenderRoot: RootRenderer = ({ children, onSubmit, id, className, style }) => (
  <form {...{ id, className, style, onSubmit }}>{children}</form>
)

export function DynamicForm_<TModel extends FieldValues, TComponentMap extends ComponentMap>(
  {
    config,
    devToolConfig = {},
    defaultValues = {},
    formProps = {},
    readOnly: isFormReadOnly = false,
    readOnlyEmptyFallback,
    changeDebounceDelay,
    children,
    renderRoot,
    onSubmit,
    onInit,
    onFieldChange,
    onFormChange,
    onSubmitSuccess,
    onSubmitError,
    ...props
  }: DynamicFormProps<TModel, TComponentMap>,
  ref: React.Ref<DynamicFormRef<TModel>>
) {
  const { renderRoot: renderRootFromContext } = useDynamicFormContext()

  const form = useForm<TModel>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
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
      const observer: WatchObserver<TModel> = (value: Partial<TModel>, { name }) => {
        if (name) onFieldChange?.(name as keyof TModel, value?.[name], form)
        onFormChange?.(value as TModel, form)
      }
      const sub = watch(changeDebounceDelay ? debounce(observer, changeDebounceDelay) : observer)
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
      <FormEngine config={config} readOnly={isFormReadOnly} readOnlyEmptyFallback={readOnlyEmptyFallback} />
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

  // @ts-expect-error: `formRendererArgs` generic not compatible
  const renderedForm = (renderRoot ?? renderRootFromContext ?? defaultRenderRoot)(formRendererArgs)

  return (
    <FormProvider {...form}>
      {renderedForm}
      <LazyDevtools config={devToolConfig} />
    </FormProvider>
  )
}

const DynamicForm = forwardRef(DynamicForm_)

export default DynamicForm
