import type { BlueFormProviderOptions } from '@/types/form-provider'
import type { FunctionComponent, PropsWithChildren } from 'react'
import {
  createConsumerHook,
  createProviderComponent,
  createProviderContext,
} from '../../helper/create-provider'

const ProviderOptionsContext = /* @__PURE__ */ createProviderContext<BlueFormProviderOptions>()

const Provider = /* @__PURE__ */ createProviderComponent(
  ProviderOptionsContext,
  (x: BlueFormProviderOptions) => x,
  'BlueFormProvider',
)

const useContextValue = /* @__PURE__ */ createConsumerHook(
  ProviderOptionsContext,
  '[react-headless-form] BlueFormProvider is missing.',
)

export const BlueFormProvider: FunctionComponent<BlueFormProviderOptions & PropsWithChildren> = ({
  children,
  ...props
}) => <Provider defaultValue={props}>{children}</Provider>

export const useBlueFormProvider = (): BlueFormProviderOptions =>
  useContextValue({ optional: true }) ?? {}
