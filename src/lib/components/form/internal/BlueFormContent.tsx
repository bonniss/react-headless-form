import type { ComponentMap } from "@/types"
import type {
  ExposedFormMethods,
  FieldChangeContext,
  RootRendererArgs,
} from "@/types/form"

import { useChangeEffect } from "@/components/helper/use-change-effect"
import { useLatestRef } from "@/components/helper/use-latest-ref"
import { debounce } from "@/components/helper/debounce"
import {
  type BaseSyntheticEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
} from "react"
import {
  type Path,
  type FieldValues,
  type SubmitHandler,
  type FieldErrors,
  type WatchObserver,
  get as getProperty,
  useFormContext,
} from "react-hook-form"
import BlueFormEngine from "./BlueFormEngine"
import { useBlueFormInternal } from "./BlueFormInternalProvider"

export function BlueFormContent<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
>({ flushRef }: { flushRef?: MutableRefObject<() => void> } = {}) {
  const form = useFormContext<TModel>()
  const { handleSubmit, watch } = form

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
    onInvalid,
    onSubmitFailure,
    rawTranslator,
  } = useBlueFormInternal()

  // Messages are stored when a field is validated: when the translator
  // changes (a language switch), validate the failing fields again so the
  // messages already shown follow the new language.
  useChangeEffect(rawTranslator, () => {
    // the live errors (`form.formState` is a snapshot of the useForm host,
    // which does not subscribe to errors)
    const control = form.control as unknown as { _formState: { errors: FieldErrors }; _fields: object }
    // Only errors that validation produced: an error from setError() (e.g. a
    // server error) would be cleared by validating the field again
    const paths = errorPaths(control._formState.errors).filter(([path, type]) =>
      VALIDATION_TYPES.includes(type) || getProperty(control._fields, path)?._f?.validate?.[type],
    )
    if (paths.length) void form.trigger(paths.map(([path]) => path) as Path<TModel>[])
  })

  // Always call the latest callbacks without recreating the subscription or
  // resetting a pending debounce timer when parent passes inline functions.
  const callbacksRef = useLatestRef({ onFieldChange, onFormChange })

  const observer = useCallback<WatchObserver<TModel>>(
    (value, { name }) => {
      const { onFieldChange, onFormChange } = callbacksRef.current
      if (name && onFieldChange) {
        const next = getProperty(value, name)
        const context = {
          name: name as Path<TModel>,
          value: next as FieldChangeContext<TModel>["value"],
          values: value as TModel,
          setValue: form.setValue,
          trigger: form.trigger,
          formState: form.formState,
        } as FieldChangeContext<TModel>

        onFieldChange(context, form)
      }
      onFormChange?.(value as TModel, form)
    },
    // form and callbacksRef are stable for the lifetime of the component
    [form, callbacksRef],
  )

  // Stable debounced observer — only recreated when the delay changes.
  // With no delay, it calls the observer synchronously.
  const debouncedObserver = useMemo(
    () => debounce(observer, changeDebounceDelay ?? 0),
    [observer, changeDebounceDelay],
  )

  useEffect(() => {
    if (flushRef) flushRef.current = debouncedObserver.flush
  }, [flushRef, debouncedObserver])

  useEffect(
    function watchFormChanges() {
      const sub = watch(debouncedObserver)
      return () => {
        sub.unsubscribe()
        // Deliver the pending change instead of dropping it on unmount
        // (or when the debounce delay changes).
        debouncedObserver.flush()
      }
    },
    [watch, debouncedObserver],
  )

  const submit = (async (raw: TModel, e) => {
    await onSubmit?.(raw, form, e)
    await onSubmitSuccess?.(raw, form, e)
  }) as SubmitHandler<TModel>

  const handleInvalid = onInvalid ?? onSubmitError

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
  } as ExposedFormMethods<any>

  const resolvedChildren =
    typeof children === "function" ? children(exposedForm) : children

  const formBody = (
    <>
      <BlueFormEngine config={config} />
      {resolvedChildren}
    </>
  )

  // Errors thrown by onSubmit/onSubmitSuccess are caught *outside*
  // handleSubmit so RHF still marks the submission as unsuccessful.
  const submitHandler = (e?: BaseSyntheticEvent) =>
    handleSubmit(
      submit,
      handleInvalid,
    )(e).catch((error: unknown) => {
      if (onSubmitFailure) {
        return onSubmitFailure(error, form.getValues(), form)
      }
      console.error("[react-headless-form] Unhandled error in onSubmit:", error)
    })
  const formRendererArgs = {
    children: formBody,
    onSubmit: submitHandler,
    ...exposedForm,
  } as RootRendererArgs<any>

  return renderRoot?.(formRendererArgs)
}

const VALIDATION_TYPES = ["required", "min", "max", "minLength", "maxLength", "pattern", "validate", "schema"]

/** [path, type] of the fields (or arrays, via `root`) that currently have an error message. */
const errorPaths = (errors: FieldErrors, prefix = ""): [string, string][] =>
  Object.entries(errors).flatMap(([key, value]: [string, any]) => {
    const path = key === "root" ? prefix : prefix ? `${prefix}.${key}` : key
    return !value || typeof value !== "object"
      ? []
      : typeof value.message === "string"
        ? [[path, value.type] as [string, string]]
        : errorPaths(value, path)
  })
