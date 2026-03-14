/* eslint-disable @typescript-eslint/no-explicit-any */
import { useController, useFormContext } from "react-hook-form";

import { createProvider } from "react-easy-provider";

import type { FieldResolvedProps, FormFieldConfig } from "../../../types";
import { useBlueFormInternal } from "../internal/BlueFormInternalProvider";

type FieldProviderParams = {
  resolved: FieldResolvedProps;
  config: FormFieldConfig<any, any>;
};

export const [useField, FieldProvider] = createProvider(
  (defaultValue: FieldProviderParams | undefined) => {
    const { resolved, config } = defaultValue!;
    const { control } = useFormContext();
    const { hasResolver } = useBlueFormInternal();

    const { path, rules, defaultValue: fieldDefaultValue } = resolved;

    const controller = useController({
      name: path,
      control,
      rules: hasResolver ? undefined : rules,
      defaultValue: fieldDefaultValue,
      disabled: resolved.disabled,
    });

    const {
      field: { value, onChange, onBlur, ref },
      fieldState,
    } = controller;

    const props: FieldResolvedProps = {
      value,
      onChange,
      onBlur,
      ref,
      errorMessage: fieldState.error?.message,
      ...fieldState,
      ...resolved,
    };

    return {
      ...props,
      controller,
      config,
    };
  },
  "FieldProvider",
);
