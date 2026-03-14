import { useArrayField } from "@/components";
import type { ReactNode } from "react";
import { FieldResolvedProps } from "./input";

// ── Regular field render ────────────────────────────────────────────────────

export type RegularRenderContext = FieldResolvedProps & {
  children?: ReactNode;
};

// ── Array field render ──────────────────────────────────────────────────────

export type ArrayRenderContext = ReturnType<typeof useArrayField> & {
  children?: ReactNode;
};

// ── Conditional render fn ───────────────────────────────────────────────────

export type RenderFn<TFieldType extends string & keyof any = string> = (
  context: TFieldType extends "array"
    ? ArrayRenderContext
    : RegularRenderContext,
) => ReactNode;
