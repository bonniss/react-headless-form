/* eslint-disable @typescript-eslint/no-explicit-any */
import { useController, useFormContext } from 'react-hook-form'

import { createProvider } from 'react-easy-provider'

import type { FieldResolvedProps, FormFieldConfig } from '../../types'

type FieldProviderParams = {
  resolved: FieldResolvedProps
  config: FormFieldConfig<any, any>
}

export const [useField, FieldProvider] = createProvider((defaultValue: FieldProviderParams | undefined) => {
  const { resolved, config } = defaultValue!
  const { control } = useFormContext()

  const { path, rules, defaultValue: fieldDefaultValue } = resolved

  const controller = useController({
    name: path,
    control,
    rules,
    defaultValue: fieldDefaultValue,
    disabled: resolved.disabled,
  })

  const {
    field: { value, onChange },
    fieldState: { error },
  } = controller

  const fieldProps: FieldResolvedProps = {
    value,
    onChange,
    errorMessage: error?.message,
    ...resolved,
  }

  return {
    controller,
    fieldProps,
    config,
  }
})
