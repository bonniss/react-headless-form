import type { RenderFn } from "@/types/render";
import { FieldArrayProvider } from "../provider";
import ArrayRenderSlot from "./ArrayRenderSlot";
import { renderStaticSlot } from "./slots";
import type { FieldRendererProps } from "./types";

/** Core renderer for `type: "array"`. Called as a function by FieldNode: must not use hooks. */
export default function ArrayField({
  field,
  resolved,
  componentProps,
  fieldMapping,
}: FieldRendererProps) {
  const ArrayComponent = fieldMapping?.array;
  const { render, slots } = field;

  if (!ArrayComponent && !render) {
    throw new Error(
      `[react-headless-form] Array field "${resolved.path}" requires either \`fieldMapping["array"]\` or \`render\`.`,
    );
  }

  return (
    <FieldArrayProvider defaultValue={{ resolved, config: field }}>
      {renderStaticSlot(slots?.before, resolved)}
      {ArrayComponent ? (
        <ArrayComponent {...componentProps} />
      ) : (
        <ArrayRenderSlot render={render as RenderFn<"array">} />
      )}
      {renderStaticSlot(slots?.after, resolved)}
    </FieldArrayProvider>
  );
}
