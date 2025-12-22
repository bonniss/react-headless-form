import { ComponentMap } from '@/types';
import debounce from 'just-debounce-it';
import { useEffect } from 'react';
import {
  FieldValues,
  get as getProperty,
  SubmitHandler,
  useFormContext,
  WatchObserver,
} from 'react-hook-form';
import BlueFormEngine from './BlueFormEngine';
import { useBlueFormInternal } from './BlueFormInteralProvider';

export function BlueFormContent<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap
>() {
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

    plugins = [],

    ...props
  } = useBlueFormInternal();
  const form = useFormContext<TModel>();
  const { watch, handleSubmit } = form;

  // biome-ignore lint/correctness/useExhaustiveDependencies: on component mount
  useEffect(() => {
    onInit?.(form);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(
    function watchFormChanges() {
      const observer: WatchObserver<TModel> = (
        value: Partial<TModel>,
        { name }
      ) => {
        if (name && onFieldChange) {
          const next = getProperty(value, name);
          onFieldChange(name, next, form);
        }
        onFormChange?.(value as TModel, form);
      };

      const sub = watch(
        changeDebounceDelay ? debounce(observer, changeDebounceDelay) : observer
      );

      return () => sub.unsubscribe();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [watch, changeDebounceDelay]
  );

  const submit = ((raw: TModel, e) => {
    onSubmit?.(raw, form, e);
    onSubmitSuccess?.(raw, form, e);
  }) as SubmitHandler<TModel>;

  const pluginNodes = plugins?.map((p) => p.render?.(form) ?? null);

  const formBody = (
    <>
      <BlueFormEngine config={config} />
      {children}
      {pluginNodes}
    </>
  );

  const submitHandler = handleSubmit(submit, onSubmitError);

  const formRendererArgs = {
    formMethods: form,
    children: formBody,
    onSubmit: submitHandler,
    submit,
    ...props,
  } as const;

  // @ts-expect-error expect error
  return renderRoot?.(formRendererArgs);
}
