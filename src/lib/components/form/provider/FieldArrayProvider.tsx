/* eslint-disable @typescript-eslint/no-explicit-any */
import { get as getProperty } from 'react-hook-form';

import type { FieldResolvedProps, FormFieldConfig } from '@/types';

import { createProvider } from 'react-easy-provider';
import { useFieldArray, useFormContext } from 'react-hook-form';

type FieldArrayProviderParams = {
  resolved: FieldResolvedProps;
  config: FormFieldConfig<any, any>;
};

export const [useArrayField, FieldArrayProvider] = createProvider(
  (defaultValue: FieldArrayProviderParams | undefined) => {
    const { resolved, config } = defaultValue!;
    const { path, rules } = resolved;

    const {
      control,
      formState: { errors },
    } = useFormContext();

    const controller = useFieldArray({
      name: path,
      control,
      rules,
    });

    const errorMessage = getProperty(errors, `${path}.root.message`);
    const fieldProps: FieldResolvedProps = {
      errorMessage,
      ...resolved,
    };

    return {
      controller,
      fieldProps,
      config,
    };
  },
  'FieldArrayProvider'
);
