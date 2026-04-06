import type { ComponentMap } from '@/types';
import {
  ExposedFormMethods,
  FieldChangeHandlerMap,
  OnFieldChange,
  RootRendererArgs,
} from '@/types/form';
import debounce from 'just-debounce-it';
import { useCallback, useEffect, useMemo } from 'react';
import {
  type Path,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
  type WatchObserver,
  get as getProperty,
  useFormContext,
} from 'react-hook-form';
import BlueFormEngine from './BlueFormEngine';
import { useBlueFormInternal } from './BlueFormInternalProvider';

function emitFieldChange<TModel extends FieldValues>(
  onFieldChange: OnFieldChange<TModel> | undefined,
  name: Path<TModel>,
  value: unknown,
  form: UseFormReturn<TModel>,
) {
  if (!onFieldChange) return;

  if (typeof onFieldChange === 'function') {
    onFieldChange(name, value as any, form);
    return;
  }

  const fieldHandler = (onFieldChange as FieldChangeHandlerMap<TModel>)[name];
  fieldHandler?.(value as never, form);
}

export function BlueFormContent<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
>() {
  const form = useFormContext<TModel>();
  const { handleSubmit, watch } = form;

  const {
    renderRoot,

    config,
    debounceMs: changeDebounceDelay,
    children,

    onSubmit,
    onFieldChange,
    onFormChange,
    onSubmitSuccess,
    onSubmitError,
  } = useBlueFormInternal();

  const observer = useCallback<WatchObserver<TModel>>(
    (value, { name }) => {
      if (name && onFieldChange) {
        const next = getProperty(value, name);
        emitFieldChange(
          onFieldChange as OnFieldChange<TModel>,
          name as Path<TModel>,
          next,
          form,
        );
      }
      onFormChange?.(value as TModel, form);
    },
    // form is stable for the lifetime of the component
    [form],
  );

  // Stable debounced observer — only recreated when delay changes.
  // Keeping it in useMemo (not useCallback) because debounce() returns
  // a plain function, not a React callback.
  const debouncedObserver = useMemo(
    () =>
      changeDebounceDelay ? debounce(observer, changeDebounceDelay) : observer,
    [observer, changeDebounceDelay],
  );

  useEffect(
    function watchFormChanges() {
      const sub = watch(debouncedObserver);
      return () => sub.unsubscribe();
    },
    [watch, debouncedObserver],
  );

  const submit = (async (raw: TModel, e) => {
    await onSubmit?.(raw, form, e);
    await onSubmitSuccess?.(raw, form, e);
  }) as SubmitHandler<TModel>;

  const exposedForm = {
    // advanced / 3rd party integration
    control: form.control,

    // read
    formState: form.formState,
    getFieldState: form.getFieldState,
    getValues: form.getValues,

    // write
    resetField: form.resetField,
    reset: form.reset,
    clearErrors: form.clearErrors,
    setError: form.setError,
    setValue: form.setValue,

    // trigger
    trigger: form.trigger,
    setFocus: form.setFocus,
  } as ExposedFormMethods<any>;

  const resolvedChildren =
    typeof children === 'function' ? children(exposedForm) : children;

  const formBody = (
    <>
      <BlueFormEngine config={config} />
      {resolvedChildren}
    </>
  );

  const submitHandler = handleSubmit(submit, onSubmitError);
  const formRendererArgs = {
    children: formBody,
    onSubmit: submitHandler,
    ...exposedForm,
  } as RootRendererArgs<any>;

  return renderRoot?.(formRendererArgs);
}
