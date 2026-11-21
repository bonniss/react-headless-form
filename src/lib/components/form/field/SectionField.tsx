/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldResolvedProps, FormSectionProps } from "@/types";
import type { RenderFn } from "@/types/render";
import BlueFormEngine from "../internal/BlueFormEngine";
import { FieldProvider } from "../provider/FieldProvider";
import { FieldSlot } from "./slots";
import type { FieldRendererProps } from "./types";

/** Core renderer for `type: "section"`. Called as a function by FieldNode: must not use hooks. */
export default function SectionField({
  field,
  resolved,
  componentProps,
}: FieldRendererProps) {
  const { render, slots } = field;
  const { path, namespace } = resolved;
  const sectionProps = componentProps as FormSectionProps<any, any> | undefined;

  const effectiveNamespace = sectionProps?.nested ? path : namespace;
  const sectionResolved = {
    ...resolved,
    namespace: effectiveNamespace,
  } as FieldResolvedProps;

  const contentConfig = sectionProps?.config;
  const SectionComponent = sectionProps?.component;

  let children = null;
  if (SectionComponent) {
    if (contentConfig) {
      console.warn(
        `[react-headless-form] Section "${path}" has both \`component\` and \`config\`. \`component\` will be used and \`config\` will be ignored.`,
      );
    }
    children = <SectionComponent />;
  } else if (contentConfig) {
    children = (
      <BlueFormEngine config={contentConfig} namespace={effectiveNamespace} />
    );
  }

  const node =
    (render as RenderFn<"section"> | undefined)?.({
      ...sectionResolved,
      children,
    }) ?? children;

  // Section props are reachable from inside via useField().
  return (
    <FieldProvider defaultValue={{ resolved: sectionResolved, config: field }}>
      {slots?.before !== undefined && <FieldSlot slot={slots.before} />}
      {node}
      {slots?.after !== undefined && <FieldSlot slot={slots.after} />}
    </FieldProvider>
  );
}
