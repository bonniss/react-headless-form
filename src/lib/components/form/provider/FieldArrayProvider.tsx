/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, useFieldArray, useFormContext, useFormState } from 'react-hook-form'
import type { FieldResolvedProps, FormFieldConfig } from '@/types'
import { createProvider } from '../../helper/create-provider'
import BlueFormEngine from '../internal/BlueFormEngine'

type FieldArrayProviderParams = {
  resolved: FieldResolvedProps
  config: FormFieldConfig<any, any>
}

function useArrayFieldValue({ resolved, config }: FieldArrayProviderParams) {
  const { path, rules } = resolved
  const itemConfig = config.props?.config

  const { control, getValues } = useFormContext()

  // NOTE: `name` here only scopes re-render subscriptions.
  // `errors` is still the full form errors object; use `getProperty(errors, path)` to access this field-array subtree.
  const { errors: formErrors } = useFormState({ name: path, control })
  const errors = get(formErrors, path)
  const controller = useFieldArray({
    name: path,
    control,
    rules,
  })

  const rootError = errors?.root ?? errors
  const errorMessage = rootError?.message

  const fieldProps: FieldResolvedProps = {
    ...resolved,
    errorMessage,
  }

  const { fields, append, insert, remove, move, swap, update, prepend, replace } = controller

  // Array helpers
  const pop = () => {
    const last = fields.length - 1
    if (last >= 0) remove(last)
  }
  const clear = () => remove()
  const duplicate = (i: number) => {
    const value = getValues(`${path}.${i}`)
    if (value == null) return
    append(value)
  }
  const errorAt = (i: number) => errors?.[i]
  const idAt = (i: number) => fields[i]?.id ?? i

  // Render helpers
  const renderItem = (field: (typeof fields)[number], index: number) => {
    return <BlueFormEngine key={field.id} config={itemConfig} namespace={`${path}.${index}`} />
  }
  const renderItems = () => fields.map(renderItem)

  return {
    ...fieldProps,
    config,

    fields,
    items: fields, // alias
    renderItem,
    renderItems,

    append,
    prepend,
    insert,
    remove,
    update,
    move,
    swap,
    replace,

    push: append, // alias
    pop,
    duplicate,
    clear,

    idAt,
    errorAt,
  }
}

export type UseArrayFieldValue = ReturnType<typeof useArrayFieldValue>

export type ArrayFieldContext = Partial<UseArrayFieldValue>

/**
 * `useArrayField()` reads the current `array` field context and throws a
 * descriptive error when called outside of it.
 */
export const [useArrayField, FieldArrayProvider] = createProvider(useArrayFieldValue, {
  name: 'FieldArrayProvider',
  errorMessage:
    '[react-headless-form] useArrayField() must be called inside an `array` field rendered by <Form>' +
    ' (a `fieldMapping` component, a `render` function or a slot).',
})
