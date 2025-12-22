import debounce from 'just-debounce-it';
import { forwardRef, useEffect, useImperativeHandle } from 'react';

import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormProps,
  WatchObserver,
  useForm,
  get as getProperty,
} from 'react-hook-form';

import { BlueFormRef } from '@/types/form';
import type { BlueFormProps, ComponentMap } from '../../types';
import BlueFormEngine from './BlueFormEngine';
import { useResolvedProps } from './hook/use-resolved-form-props';

export function BlueFormInner<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
>(
  blueFormProps: BlueFormProps<TModel, TComponentMap>,
  ref: React.Ref<BlueFormRef<TModel>>
) {
  const {
    fieldMapping,
    i18nConfig,
    renderRoot,
    readOnlyEmptyFallback,

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
  } = useResolvedProps(blueFormProps)

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
        if (name && onFieldChange) {
          const next = getProperty(value, name)
          onFieldChange(name, next, form)
        }
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
      <BlueFormEngine
        readOnly={isFormReadOnly}
        i18nConfig={i18nConfig}
        fieldMapping={fieldMapping}
        // @ts-expect-error | FIXME: Types of property 'type' are incompatible. Type 'keyof TComponentMap' is not assignable to type 'string'. Type 'string | number | symbol' is not assignable to type
        config={config}
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
  } as const

  // @ts-expect-error expect error
  const renderedForm = renderRoot?.(formRendererArgs)

  return <FormProvider {...form}>{renderedForm}</FormProvider>
}

const BlueForm = forwardRef(BlueFormInner);

export default BlueForm;
