import {
  type FieldValues,
  type UseFormProps,
  FormProvider,
  useForm,
} from "react-hook-form";

import type { BlueFormRef, BlueFormRefValue } from "@/types/form";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { standardSchemaResolver } from "@/components/helper/standard-schema";

const noop = () => {};
import type { BlueFormProps, ComponentMap } from "../../types";
import { BlueFormContent } from "./internal/BlueFormContent";
import { BlueFormInternalProvider } from "./internal/BlueFormInternalProvider";

function hasRulesInConfig(config: Record<string, any>): boolean {
  return Object.values(config).some((field) => {
    if (!field) return false;
    if (field.rules && Object.keys(field.rules).length > 0) return true;
    // recurse vào section/group
    if (field.props?.config) return hasRulesInConfig(field.props.config);
    return false;
  });
}

export function BlueFormInner<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
>(
  blueFormProps: BlueFormProps<TModel, TComponentMap>,
  ref: React.Ref<BlueFormRef<TModel>>,
) {
  const { defaultValues, formOptions, config, schema } = blueFormProps;
  // The resolver is created once per schema instance.
  const schemaResolver = useMemo(
    () => (schema ? standardSchemaResolver(schema) : undefined),
    [schema],
  );
  if (schema && formOptions?.resolver) {
    console.warn(
      "[react-headless-form] Both `schema` and `formOptions.resolver` are set; `schema` is used.",
    );
  }
  const form = useForm<TModel>({
    mode: "onTouched",
    reValidateMode: "onChange",
    ...formOptions,
    ...(schemaResolver ? { resolver: schemaResolver } : {}),
    defaultValues,
  } as UseFormProps<TModel>);
  const flushRef = useRef<() => void>(noop);
  useImperativeHandle(
    ref,
    () =>
      ({
        ...form,
        flushChanges: () => flushRef.current(),
      }) as BlueFormRefValue<TModel>,
    [form],
  );

  if (
    (schemaResolver || formOptions?.resolver) &&
    hasRulesInConfig(config as Record<string, any>)
  ) {
    console.warn(
      "[react-headless-form] `rules` defined in field config are automatically disabled when `schema` or `formOptions.resolver` is provided. " +
        "Define all validation in your schema instead.",
    );
  }

  return (
    <FormProvider {...form}>
      <BlueFormInternalProvider defaultValue={blueFormProps}>
        <BlueFormContent<TModel, TComponentMap> flushRef={flushRef} />
      </BlueFormInternalProvider>
    </FormProvider>
  );
}

// Pure: lets bundlers drop the form when an app only imports helpers.
const BlueForm = /* @__PURE__ */ forwardRef(BlueFormInner);

export default BlueForm;
