/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UseControllerProps, useController, useFormContext } from 'react-hook-form'
import type { FieldResolvedProps, FormFieldConfig } from '../../../types'
import {
  createConsumerHook,
  createProviderComponent,
  createProviderContext,
} from '../../helper/create-provider'
import { useBlueFormInternal } from '../internal/BlueFormInternalProvider'

type FieldProviderParams = {
  resolved: FieldResolvedProps
  config: FormFieldConfig<any, any>
}

function useFieldValue({ resolved, config }: FieldProviderParams) {
  const { control } = useFormContext()
  const { hasResolver } = useBlueFormInternal()

  const { path, rules, defaultValue: fieldDefaultValue } = resolved

  const controller = useController({
    name: path,
    control,
    // patterns are normalized to RegExp by resolveRules()
    rules: hasResolver ? undefined : (rules as UseControllerProps['rules']),
    defaultValue: fieldDefaultValue,
    disabled: resolved.disabled,
  })

  const {
    field: { value, onChange, onBlur, ref },
    fieldState,
  } = controller

  const props: FieldResolvedProps = {
    value,
    onChange,
    onBlur,
    ref,
    errorMessage: fieldState.error?.message,
    ...fieldState,
    ...resolved,
  }

  return {
    ...props,
    // always provided by the controller; typed as required for consumers
    value,
    onChange,
    onBlur,
    controller,
    config,
  }
}

export type UseFieldValue = ReturnType<typeof useFieldValue>

/**
 * `useField()` reads the current field context and throws a descriptive error
 * when called outside of it.
 */
const FieldContext = /* @__PURE__ */ createProviderContext<UseFieldValue>()

export const FieldProvider = /* @__PURE__ */ createProviderComponent(
  FieldContext,
  useFieldValue,
  'FieldProvider',
)

export const useField = /* @__PURE__ */ createConsumerHook(
  FieldContext,
  '[react-headless-form] useField() must be called inside a field rendered by <Form>' +
    ' (a `fieldMapping` component, a `render` function or a slot).',
)
