/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useMemo } from "react";
import { type FieldValues, useFormContext } from "react-hook-form";

import type {
  BlueFormProps,
  ComponentMap,
  CoreFieldType,
  FieldResolvedProps,
  FormFieldConfig,
  FormSectionProps,
} from "@/types";

import { resolveRules } from "@/components/helper/resolve-rules";
import { ArrayRenderSlot } from "../field";
import HiddenField from "../field/HiddenField";
import InlineField from "../field/InlineField";
import { FieldArrayProvider } from "../provider";
import { FieldProvider } from "../provider/FieldProvider";
import { useBlueFormInternal } from "./BlueFormInternalProvider";

interface BlueFormEngineProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> extends Pick<BlueFormProps<TModel, TComponentMap>, "config"> {
  namespace?: string;
}

/**
 * Checks whether a config object (at this engine level only) contains any field
 * that uses `visible` or `disabled` as a function.
 *
 * Used to decide whether this BlueFormEngine instance needs to subscribe to form
 * values via watch(). If no field uses conditional logic, the subscription is
 * skipped — avoiding full-form re-renders on every keystroke for this engine level.
 *
 * Scans only the direct fields of the given config. Nested section configs are
 * handled by their own child BlueFormEngine instance, which runs its own scan.
 */
function hasConditionalFields(config: Record<string, any>): boolean {
  return Object.values(config).some(
    (field) =>
      typeof field?.visible === "function" ||
      typeof field?.disabled === "function",
  );
}

function BlueFormEngine<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
>({ config, namespace }: BlueFormEngineProps<TModel, TComponentMap>) {
  const {
    i18nConfig: { t, validationResolver },
    fieldMapping,
    readOnly: isFormReadOnly,
  } = useBlueFormInternal();
  const { watch } = useFormContext();

  // Determine whether any field at this config level uses conditional logic.
  // Memoized because config is typically a stable object reference (defined
  // outside the component tree), and the scan itself is cheap O(n).
  // Even when config is unstable, this avoids the watch() subscription cost
  // for the common case where no conditional fields exist.
  const needsValues = useMemo(() => hasConditionalFields(config), [config]);

  // Only call watch() — and therefore only subscribe to form state changes —
  // when at least one field at this level needs it.
  //
  // When needsValues is false:
  //   - watch() is never called on this render
  //   - This engine instance won't re-render on form value changes
  //   - Only re-renders when its own props/context change (e.g. config swap)
  //
  // When needsValues is true:
  //   - Behavior is identical to before: full form subscription
  //   - Future optimization: scope to specific field paths via useWatch({ name: deps })
  //     once visibleDeps/disabledDeps API is added (roadmap P1 #5)
  const values = (needsValues ? watch() : {}) as Partial<TModel>;

  const body = (
    <>
      {Object.entries(config).map(([key, fieldConfig], index) => {
        let component = null;
        const field = fieldConfig as FormFieldConfig<TModel, TComponentMap>;
        const type = field.type as string;
        const {
          props: componentProps,
          render,
          visible = true,
          disabled = false,
          defaultValue,
          label,
          rules = {},
          description,
          readOnly: isFieldReadOnly,
        } = field;

        const path = (namespace ? `${namespace}.${key}` : key) as string;

        const translatedLabel = t(label);
        const translatedDescription = t(description);

        const isVisible =
          typeof visible === "function" ? visible(values) : visible !== false;
        const isDisabled =
          typeof disabled === "function" ? disabled(values) : !!disabled;
        const isReadonly = Boolean(isFormReadOnly ?? isFieldReadOnly);
        const isRequired = Boolean(rules?.required);
        const resolvedRules = resolveRules(
          rules,
          validationResolver,
          translatedLabel,
        );

        const resolvedProps = {
          id: path,
          namespace,
          path,
          name: key,
          type,
          label: translatedLabel,
          description: translatedDescription,
          disabled: isDisabled,
          readOnly: isReadonly,
          visible: isVisible,
          required: isRequired,
          rules: resolvedRules,
          defaultValue,
        } as FieldResolvedProps;

        switch (type as CoreFieldType) {
          case "array": {
            const ArrayField = fieldMapping?.["array"];
            if (!ArrayField && !render) {
              throw new Error(
                `[react-headless-form] Array field "${resolvedProps.name}" requires either a fieldMapping["array"] component or a render() function in its config.`,
              );
            }

            component = (
              <FieldArrayProvider
                defaultValue={{ resolved: resolvedProps, config: field }}
              >
                {ArrayField ? (
                  <ArrayField {...componentProps} />
                ) : (
                  <ArrayRenderSlot render={render} />
                )}
              </FieldArrayProvider>
            );

            break;
          }

          case "section": {
            const sectionProps = componentProps as FormSectionProps<
              TModel,
              TComponentMap
            >;
            let children = null;

            const nested = sectionProps?.nested ?? false;
            const effectiveNamespace = nested ? path : namespace;
            const sectionResolvedProps = {
              ...resolvedProps,
              namespace: effectiveNamespace,
            } as FieldResolvedProps;

            const contentConfig = sectionProps?.config;
            const SectionComponent = sectionProps?.component;

            if (SectionComponent) {
              if (contentConfig) {
                console.warn(
                  `[react-headless-form] Section "${path}" has both "component" and "config". ` +
                    `"component" will be used and "config" will be ignored.`,
                );
              }
              children = <SectionComponent />;
            } else if (contentConfig) {
              children = (
                <BlueFormEngine
                  config={contentConfig}
                  namespace={effectiveNamespace}
                />
              );
            }

            const node =
              render?.({
                ...sectionResolvedProps,
                children,
              }) ?? children;

            // allow deeply access to fieldProps for form section
            component = (
              <FieldProvider
                defaultValue={{ resolved: sectionResolvedProps, config: field }}
              >
                {node}
              </FieldProvider>
            );

            break;
          }

          default: {
            let Component = fieldMapping?.[type];
            if (!Component && (type as CoreFieldType) === "hidden") {
              Component = HiddenField;
            }
            if (!Component && (type as CoreFieldType) === "inline") {
              Component = InlineField;
            }
            if (Component) {
              component = (
                <FieldProvider
                  defaultValue={{ resolved: resolvedProps, config: field }}
                >
                  <Component {...componentProps} />
                </FieldProvider>
              );
            } else {
              throw new Error(
                `[react-headless-form] No renderer found for field **${path}** with type **${type}**`,
              );
            }
            break;
          }
        }

        return <Fragment key={path}>{component}</Fragment>;
      })}
    </>
  );

  return body;
}

export default BlueFormEngine;
