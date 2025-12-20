/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from 'react'
import { FieldValues, useFormContext } from 'react-hook-form'

import type {
  ComponentMap,
  CoreFieldType,
  DynamicFormProps,
  FieldResolvedProps,
  FormFieldConfig,
  NestedFieldProps,
} from '../types'

import HiddenField from './fields/HiddenField'

import InlineField from './fields/InlineField'
import { FieldArrayProvider } from './providers/FieldArrayProvider'
import { FieldProvider } from './providers/FieldProvider'
import { useDynamicFormContext } from './providers/FormProvider'

interface FormEngineProps<TModel extends FieldValues, TComponentMap extends ComponentMap>
  extends Pick<DynamicFormProps<TModel, TComponentMap>, 'config' | 'readOnly' | 'readOnlyEmptyFallback'> {
  namespace?: string
}

function FormEngine<TModel extends FieldValues, TComponentMap extends Record<string, any>>({
  config,
  readOnly: isFormReadOnly,
  readOnlyEmptyFallback,
  namespace,
}: FormEngineProps<TModel, TComponentMap>) {
  const {
    fieldMapping,
    i18nConfig = {},
    readOnlyEmptyFallback: readOnlyEmptyFallbackFromContext,
  } = useDynamicFormContext()
  const { t, validationResolver = {}, enabled: isI18nEnabled } = i18nConfig

  const { watch } = useFormContext()
  const values = watch() as Partial<TModel>

  const body = (
    <>
      {Object.entries(config).map(([key, fieldConfig], index) => {
        let component = null
        const field = fieldConfig as FormFieldConfig<TModel, TComponentMap>
        const type = field.type as string
        const {
          props: componentProps,
          render,
          visible = true,
          disabled = false,
          defaultValue,
          label,
          rules = {},
          description,
          readOnly: isFieldReadOnly,
        } = field

        const path = (namespace ? `${namespace}.${key}` : key) as string

        const translatedLabel = t?.(label)
        const translatedDescription = t?.(description)

        const isVisible = typeof visible === 'function' ? visible(values) : visible !== false
        const isDisabled = typeof disabled === 'function' ? disabled(values) : !!disabled
        const isReadonly = Boolean(isFormReadOnly ?? isFieldReadOnly)
        const isRequired = Boolean(rules?.required)

        if (isI18nEnabled && !!Object.keys(rules).length && !!Object.keys(validationResolver).length) {
          for (const key in rules) {
            if (Object.hasOwnProperty.call(rules, key)) {
              const ruleType = key as keyof typeof rules
              const rule = rules[ruleType]
              const resolver = validationResolver[ruleType]

              if (rule && resolver) {
                const resolvedRule = resolver({ field: translatedLabel!, rule: rule! as any, translator: t })
                if (resolvedRule) {
                  rules[ruleType] = resolvedRule as any
                }
              }
            }
          }
        }

        const resolvedProps = {
          id: path,
          path,
          name: key,
          namespace,
          type,
          label: translatedLabel,
          description: translatedDescription,
          disabled: isDisabled,
          readOnly: isReadonly,
          visible: isVisible,
          required: isRequired,
          readOnlyEmptyFallback: readOnlyEmptyFallback ?? readOnlyEmptyFallbackFromContext,
          rules,
          defaultValue,
        } as FieldResolvedProps

        switch (type as CoreFieldType) {
          case 'array': {
            const ArrayField = fieldMapping?.['array']
            if (!ArrayField) {
              throw new Error(`No component of array field found for **${name}**`)
            }
            component = (
              <FieldArrayProvider defaultValue={{ resolved: resolvedProps, config: field }}>
                <ArrayField {...componentProps} />
              </FieldArrayProvider>
            )
            break
          }
          case 'group':
          case 'ui': {
            const contentConfig = (componentProps as NestedFieldProps<TModel, TComponentMap>)?.config
            let children = null

            if (contentConfig) {
              children = (
                <FormEngine
                  config={contentConfig}
                  readOnly={isFormReadOnly}
                  readOnlyEmptyFallback={readOnlyEmptyFallback}
                  namespace={(type as CoreFieldType) === 'ui' ? namespace : path}
                />
              )
            }

            component = render?.({ fieldProps: resolvedProps, children, props: componentProps }) ?? children
            break
          }
          default: {
            let Component = fieldMapping?.[type]
            if (!Component && (type as CoreFieldType) === 'hidden') {
              Component = HiddenField
            }
            if (!Component && (type as CoreFieldType) === 'inline') {
              Component = InlineField
            }
            if (Component) {
              component = (
                <FieldProvider defaultValue={{ resolved: resolvedProps, config: field }}>
                  <Component {...componentProps} />
                </FieldProvider>
              )
            } else {
              throw new Error(`No renderer found for field **${path}** with type **${type}**`)
            }
            break
          }
        }

        return <Fragment key={path}>{component}</Fragment>
      })}
    </>
  )

  return body
}

export default FormEngine
