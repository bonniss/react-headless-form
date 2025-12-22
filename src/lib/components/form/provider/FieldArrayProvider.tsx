/* eslint-disable @typescript-eslint/no-explicit-any */
import { get as getProperty } from "react-hook-form"

import type { FieldResolvedProps, FormFieldConfig } from "@/types"

import { createProvider } from "react-easy-provider"
import { useFieldArray, useFormContext } from "react-hook-form"
import BlueFormEngine from "../internal/BlueFormEngine"

type FieldArrayProviderParams = {
  resolved: FieldResolvedProps
  config: FormFieldConfig<any, any>
}

export const [useArrayField, FieldArrayProvider] = createProvider(
  (params: FieldArrayProviderParams | undefined) => {
    const { resolved, config } = params!
    const { path, rules } = resolved
    const itemConfig = config.props?.config

    const {
      control,
      formState: { errors },
    } = useFormContext()

    const controller = useFieldArray({
      name: path,
      control,
      rules,
    })

    const errorMessage = getProperty(errors, `${path}.root.message`)
    const fieldProps: FieldResolvedProps = {
      errorMessage,
      ...resolved,
    }

    const { fields } = controller

    const renderItem = (field: (typeof fields)[number], index: number) => {
      return (
        <BlueFormEngine
          key={field.id ?? index}
          config={itemConfig}
          namespace={`${path}.${index}`}
        />
      )
    }

    return {
      renderItem,
      controller,
      fieldProps,
      config,
    }
  },
  "FieldArrayProvider"
)
