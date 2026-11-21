/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RenderFn } from "@/types/render";
import { FieldProvider } from "../provider/FieldProvider";
import HiddenField from "./HiddenField";
import InlineField from "./InlineField";
import { FieldSlot } from "./slots";
import type { FieldRendererProps } from "./types";

/** Renderer for `hidden`, `inline` and every `fieldMapping` type. Called as a function by FieldNode: must not use hooks. */
export default function StandardField({
  field,
  resolved,
  componentProps,
  fieldMapping,
}: FieldRendererProps) {
  const { render, slots } = field;
  const { path } = resolved;
  const type = field.type as string;

  let node: any;
  if (type === "hidden") {
    node = <HiddenField {...componentProps} />;
  } else if (type === "inline") {
    node = <InlineField {...componentProps} />;
  } else {
    const Component = fieldMapping?.[type];
    if (!Component) {
      throw new Error(
        `[react-headless-form] No renderer found for field "${path}" with type "${type}". Check your \`fieldMapping\` or field \`type\`.`,
      );
    }
    const element = <Component {...componentProps} />;
    node = render
      ? (render as RenderFn<string>)({ ...resolved, self: element })
      : element;
  }

  return (
    <FieldProvider defaultValue={{ resolved, config: field }}>
      {slots?.before !== undefined && <FieldSlot slot={slots.before} />}
      {node}
      {slots?.after !== undefined && <FieldSlot slot={slots.after} />}
    </FieldProvider>
  );
}
