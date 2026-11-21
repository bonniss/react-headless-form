import type { FieldResolvedProps, FieldSlotContent } from "@/types";
import { useField } from "../provider/FieldProvider";

/**
 * Renders a `slots.before` / `slots.after` entry. Function slots receive the
 * live field context from the enclosing `FieldProvider`.
 */
export function FieldSlot({ slot }: { slot: FieldSlotContent }) {
  const field = useField();
  return <>{typeof slot === "function" ? slot(field) : slot}</>;
}

/** Slots outside a `FieldProvider` (array fields) receive the resolved props. */
export function renderStaticSlot(
  slot: FieldSlotContent | undefined,
  ctx: FieldResolvedProps,
) {
  if (slot === undefined) return null;
  return typeof slot === "function" ? slot(ctx) : slot;
}
