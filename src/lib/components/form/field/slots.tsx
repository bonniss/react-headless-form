import type { FieldResolvedProps, FieldSlotContent } from "@/types";
import type { ReactNode } from "react";
import { useArrayField } from "../provider/FieldArrayProvider";
import { useField } from "../provider/FieldProvider";

/**
 * Renders a `slots.before` / `slots.after` entry. Function slots receive the
 * live field context from the enclosing `FieldProvider`.
 */
export function FieldSlot({ slot }: { slot: FieldSlotContent }) {
  const field = useField();
  return <>{typeof slot === "function" ? slot(field) : slot}</>;
}

/**
 * `render` of a mapped field: it decorates `self` and reads the live field
 * state, without the write handlers (those belong to the component).
 */
export function MappedRender({
  render,
  self,
}: {
  render: (ctx: any) => ReactNode;
  self: ReactNode;
}) {
  const { onChange: _c, onBlur: _b, ref: _r, controller: _ctrl, config: _cfg, ...state } = useField();
  return <>{render({ ...state, self })}</>;
}

/** Slots of an array field: its metadata plus the array-level `errorMessage`. */
export function ArraySlot({ slot }: { slot: FieldSlotContent | undefined }) {
  const { fields: _f, items: _i, ...field } = useArrayField();
  if (slot === undefined) return null;
  return <>{typeof slot === "function" ? slot(field as unknown as FieldResolvedProps) : slot}</>;
}
