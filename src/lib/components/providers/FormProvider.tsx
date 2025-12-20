import { createProvider } from 'react-easy-provider'
import { FunctionComponent, PropsWithChildren } from 'react'
import { TranslationResolver, ValidationResolver } from '../../i18n'
import type { ComponentMap, DynamicFormCommonProps } from '../../types'

export interface DynamicFormProviderOptions extends DynamicFormCommonProps {
  /**
   * Internationalization (i18n) and validation message configuration.
   */
  i18nConfig?: {
    /**
     * Whether to enable i18n support for validation messages.
     * If false or omitted, messages will fallback to raw/default text.
     */
    enabled?: boolean

    /**
     * Translation function used to resolve localized message strings.
     * If not provided, defaults to an identity function: (key) => key
     */
    t?: TranslationResolver

    /**
     * Custom resolver for formatting validation messages.
     * Allows overriding or extending default error message generation logic.
     */
    validationResolver?: ValidationResolver
  }

  /**
   * Mapping between field types and React components used to render them.
   * Example: `{ text: TextField, select: SelectField }`
   */
  fieldMapping?: ComponentMap
}

const [useDynamicFormContext, _FormProvider] = createProvider(
  (defaultValue: DynamicFormProviderOptions | undefined) => {
    return defaultValue!
  }
)

export const DynamicFormProvider: FunctionComponent<DynamicFormProviderOptions & PropsWithChildren> = ({
  children,
  ...props
}) => <_FormProvider defaultValue={props}>{children}</_FormProvider>

export { useDynamicFormContext }
