/* eslint-disable @typescript-eslint/no-explicit-any */
import { get as getProperty, useFormState } from 'react-hook-form';

import type { FieldResolvedProps, FormFieldConfig } from '@/types';

import { createProvider } from 'react-easy-provider';
import { useFieldArray, useFormContext } from 'react-hook-form';
import BlueFormEngine from '../internal/BlueFormEngine';

type FieldArrayProviderParams = {
  resolved: FieldResolvedProps;
  config: FormFieldConfig<any, any>;
};

export const [useArrayField, FieldArrayProvider] = createProvider(
  (params: FieldArrayProviderParams | undefined) => {
    const { resolved, config } = params!;
    const { path, rules } = resolved;
    const itemConfig = config.props?.config;

    const { control } = useFormContext();

    // NOTE: `name` here only scopes re-render subscriptions.
    // `errors` is still the full form errors object; use `getProperty(errors, path)` to access this field-array subtree.
    const { errors: formErrors } = useFormState({ name: path, control });
    const errors = getProperty(formErrors, path);
    const controller = useFieldArray({
      name: path,
      control,
      rules,
    });

    const rootError = errors?.root;
    const errorMessage = rootError?.message;
    const fieldProps: FieldResolvedProps = {
      ...resolved,
      errorMessage,
    };

    const {
      fields,
      append,
      insert,
      remove,
      move,
      swap,
      update,
      prepend,
      replace,
    } = controller;

    // Helpers
    const errorAt = (i: number) => errors?.[i];
    const idAt = (i: number) => fields[i]?.id ?? i;

    const renderItem = (field: (typeof fields)[number], index: number) => {
      return (
        <BlueFormEngine
          key={field.id ?? index}
          config={itemConfig}
          namespace={`${path}.${index}`}
        />
      );
    };

    return {
      fieldProps,
      config,

      fields,
      items: fields, // alias

      renderItem,

      append,
      insert,
      remove,
      move,
      swap,
      update,
      prepend,
      replace,

      push: append, // alias

      errorAt,
      idAt,
    };
  },
  'FieldArrayProvider',
);
