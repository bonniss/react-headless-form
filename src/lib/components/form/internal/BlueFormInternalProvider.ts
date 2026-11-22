import { useId } from 'react'
import { createConsumerHook, createProviderComponent, createProviderContext } from '@/components/helper/create-provider'
import { identity } from '@/components/helper/identity'
import { typedKeys } from '@/components/helper/typed-keys'
import type { ValidationResolver } from '@/components/i18n'
import { normalizeTranslator } from '@/components/i18n/resolver'
import type { BlueFormProps } from '@/types'
import type { I18nResolvedConfig } from '@/types/form'
import { useBlueFormProvider } from '../provider'

function useBlueFormInternalValue(
  blueFormProps: BlueFormProps<any, any> = {
    config: {},
  },
) {
  const { fieldMapping: fieldMapping_, i18nConfig: i18nConfig_, renderRoot: renderRoot_, ...props } = blueFormProps

  const { renderRoot: _renderRoot, fieldMapping: _fieldMapping, i18nConfig: _i18nConfig } = useBlueFormProvider()

  const fieldMapping = fieldMapping_ ?? _fieldMapping
  // Unique per form, so field ids do not collide between forms on one page
  const generatedId = useId()
  const renderRoot = renderRoot_ ?? _renderRoot
  const i18nConfig = i18nConfig_ ?? _i18nConfig

  if (!renderRoot) {
    throw new Error(
      '[react-headless-form] No `renderRoot` was provided. A `renderRoot` is required to control how the form is rendered.',
    )
  }

  // Always normalize so object forms ({ message } / { text }) resolve to
  // strings even when i18n is disabled.
  const t = normalizeTranslator(i18nConfig?.enabled === false ? identity : (i18nConfig?.t ?? identity))
  const resolver: ValidationResolver = {}

  if (i18nConfig?.validationTranslation && Object.keys(i18nConfig.validationTranslation).length) {
    for (const validationType of typedKeys(i18nConfig.validationTranslation)) {
      const messageKey = i18nConfig.validationTranslation[validationType]
      if (!messageKey) continue

      switch (validationType) {
        case 'required': {
          resolver[validationType] = ({ field }) =>
            t({
              message: messageKey,
              params: { field },
            })
          break
        }

        case 'min':
        case 'max':
        case 'minLength':
        case 'maxLength': {
          resolver[validationType] = ({ field, rule }) => {
            if (rule == null) return undefined

            const value =
              typeof rule === 'number'
                ? rule
                : typeof rule === 'string'
                  ? Number(rule)
                  : typeof rule === 'object'
                    ? Number(rule.value)
                    : NaN

            if (!Number.isFinite(value)) return undefined

            return {
              value,
              message:
                t({
                  message: messageKey,
                  params: {
                    field,
                    [validationType]: value,
                  },
                }) ?? messageKey,
            }
          }
          break
        }

        case 'pattern': {
          resolver[validationType] = ({ field, rule }) => {
            if (!rule) return undefined

            // String patterns are already converted by resolveRules()
            const value = (typeof rule === 'object' && 'value' in rule ? rule.value : rule) as RegExp

            return {
              value,
              message:
                t({
                  message: messageKey,
                  params: { field },
                }) ?? messageKey,
            }
          }
          break
        }

        default:
          break
      }
    }
  }

  return {
    renderRoot,
    i18nConfig: {
      t,
      validationResolver: resolver,
      translateProps: i18nConfig?.translateProps ?? [],
    } as I18nResolvedConfig,
    fieldMapping,
    hasResolver: Boolean(props.schema || props.formOptions?.resolver),
    /** The translator as passed in, to notice a language change (`t` above is rebuilt every render). */
    rawTranslator: i18nConfig?.enabled === false ? undefined : i18nConfig?.t,
    ...props,
    idPrefix: props.idPrefix ?? generatedId,
  }
}

const BlueFormInternalContext = /* @__PURE__ */ createProviderContext<ReturnType<typeof useBlueFormInternalValue>>()

export const BlueFormInternalProvider = /* @__PURE__ */ createProviderComponent(
  BlueFormInternalContext,
  useBlueFormInternalValue,
  'BlueFormInternalProvider',
)

export const useBlueFormInternal = /* @__PURE__ */ createConsumerHook(
  BlueFormInternalContext,
  '[react-headless-form] Internal form context is missing. Render fields through <Form> from setupForm().',
)
