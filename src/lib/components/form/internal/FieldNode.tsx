/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useMemo } from "react";

import type { FieldResolvedProps, FormFieldConfig } from "@/types";
import ArrayField from "../field/ArrayField";
import SectionField from "../field/SectionField";
import StandardField from "../field/StandardField";
import { useBlueFormInternal } from "./BlueFormInternalProvider";
import { compileField } from "./compile-field";
import { useFieldConditions } from "./use-field-conditions";

type FieldNodeProps = {
  /** Config key of the field (without namespace). */
  name: string;
  field: FormFieldConfig<any, any>;
  namespace?: string;
};

/**
 * One field of a config level. Each node owns its subscriptions, so a value
 * change re-renders only the nodes whose conditions change (plus the field
 * whose value changed, through its own `useController`).
 *
 * Three phases:
 * 1. compile — config + i18n → path, translations, rules (memoized)
 * 2. runtime evaluation — `visible` / `disabled` / `required`
 * 3. render — the renderer for the field type
 */
function FieldNode({ name, field, namespace }: FieldNodeProps) {
  const {
    i18nConfig,
    fieldMapping,
    readOnly: formReadOnly,
  } = useBlueFormInternal();

  const compiled = useMemo(
    () => compileField({ name, field, namespace, i18n: i18nConfig, formReadOnly }),
    [name, field, namespace, i18nConfig, formReadOnly],
  );

  const { visible, disabled, required } = useFieldConditions(field);

  const resolved = useMemo(() => {
    const { base } = compiled;
    // Same key order as before the split, for anyone serializing it.
    return {
      id: base.id,
      namespace: base.namespace,
      path: base.path,
      name: base.name,
      type: compiled.type,
      label: base.label,
      description: base.description,
      disabled,
      readOnly: base.readOnly,
      visible,
      required,
      rules: base.rules,
      defaultValue: base.defaultValue,
    } as FieldResolvedProps;
  }, [compiled, visible, disabled, required]);

  if (!visible) return null;

  const props = {
    field,
    resolved,
    componentProps: compiled.componentProps,
    fieldMapping,
  };

  // Renderers use no hooks, so they are called directly (one fiber less per field).
  switch (compiled.type) {
    case "array":
      return ArrayField(props);
    case "section":
      return SectionField(props);
    default:
      return StandardField(props);
  }
}

export default memo(FieldNode);
