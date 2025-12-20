import { BlueFormProviderOptions } from "@/types/form-provider"
import { FunctionComponent, PropsWithChildren } from "react"
import { createProvider } from "react-easy-provider"

const [useContextValue, Provider] = createProvider(
  (x?: BlueFormProviderOptions) => x
)

const DEFAULT_BLUE_FORM_CONTEXT: BlueFormProviderOptions = {
  i18nConfig: {
    enabled: false,
  },
  fieldMapping: {},
}

export const BlueFormProvider: FunctionComponent<
  BlueFormProviderOptions & PropsWithChildren
> = ({ children, ...props }) => (
  <Provider defaultValue={props}>{children}</Provider>
)

export const useBlueFormProvider = () =>
  useContextValue({
    shouldFailQuietly: true,
    fallback: DEFAULT_BLUE_FORM_CONTEXT,
  }) ?? {}
