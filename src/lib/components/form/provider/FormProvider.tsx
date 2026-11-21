import type { BlueFormProviderOptions } from '@/types/form-provider'
import type { FunctionComponent, PropsWithChildren } from 'react'
import { createProvider } from '../../helper/create-provider'

const [useContextValue, Provider] = createProvider((x: BlueFormProviderOptions) => x, {
  name: 'BlueFormProvider',
  errorMessage: '[react-headless-form] BlueFormProvider is missing.',
})

export const BlueFormProvider: FunctionComponent<BlueFormProviderOptions & PropsWithChildren> = ({
  children,
  ...props
}) => <Provider defaultValue={props}>{children}</Provider>

export const useBlueFormProvider = (): BlueFormProviderOptions =>
  useContextValue({ optional: true }) ?? {}
