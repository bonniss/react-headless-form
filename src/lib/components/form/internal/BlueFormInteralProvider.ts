import { createProvider } from "react-easy-provider"
import { identity } from "@/components/helper/identity"
import { typedKeys } from "@/components/helper/typed-keys"
import type { ValidationResolver } from "@/components/i18n"
import { normalizeTranslator } from "@/components/i18n/resolver"
import type { BlueFormProps } from "@/types"
import type { I18nResolvedConfig } from "@/types/form"
import { useBlueFormProvider } from "../provider"

export const [useBlueFormInternal, BlueFormInteralProvider] = createProvider(
  (
    blueFormProps: BlueFormProps<any, any> = {
      config: {},
    }
  ) => {
    const {
      fieldMapping: fieldMapping_,
      i18nConfig: i18nConfig_,
      renderRoot: renderRoot_,
      readOnlyEmptyFallback: readOnlyEmptyFallback_,
      ...props
    } = blueFormProps

    const {
      renderRoot: _renderRoot,
      fieldMapping: _fieldMapping,
      i18nConfig: _i18nConfig,
      readOnlyEmptyFallback: _readOnlyEmptyFallback,
    } = useBlueFormProvider()

    const fieldMapping = fieldMapping_ ?? _fieldMapping
    const renderRoot = renderRoot_ ?? _renderRoot
    const i18nConfig = i18nConfig_ ?? _i18nConfig
    const readOnlyEmptyFallback =
      readOnlyEmptyFallback_ ?? _readOnlyEmptyFallback

    if (!renderRoot) {
      throw new Error(
        "No `renderRoot` was provided. A `renderRoot` is required to control how the form is rendered."
      )
    }

    const t =
      i18nConfig?.enabled === false
        ? identity
        : normalizeTranslator(i18nConfig?.t ?? identity)
    const resolver: ValidationResolver = {}

    if (
      i18nConfig?.validationTranslation &&
      Object.keys(i18nConfig.validationTranslation).length
    ) {
      for (const validationType of typedKeys(
        i18nConfig.validationTranslation
      )) {
        const messageKey = i18nConfig.validationTranslation[validationType]
        if (!messageKey) continue

        switch (validationType) {
          case "required": {
            resolver[validationType] = ({ field }) =>
              t({
                message: messageKey,
                params: { field },
              })
            break
          }

          case "min":
          case "max":
          case "minLength":
          case "maxLength": {
            resolver[validationType] = ({ field, rule }) => {
              if (rule == null) return undefined

              const value =
                typeof rule === "number"
                  ? rule
                  : typeof rule === "string"
                  ? Number(rule)
                  : typeof rule === "object"
                  ? Number(rule.value)
                  : NaN

              if (!Number.isFinite(value)) return undefined

              return {
                value,
                message: t({
                  message: messageKey,
                  params: {
                    field,
                    [validationType]: value,
                  },
                }),
              }
            }
            break
          }

          case "pattern": {
            resolver[validationType] = ({ field, rule }) => {
              if (!rule) return undefined

              const value =
                typeof rule === "object" && "value" in rule ? rule.value : rule

              return {
                value,
                message: t({
                  message: messageKey,
                  params: { field },
                }),
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
      } as I18nResolvedConfig,
      fieldMapping,
      readOnlyEmptyFallback,
      ...props,
    }
  }
)
