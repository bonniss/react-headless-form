import type { useArrayField } from "@/components";
import type { ReactNode } from "react";
import type { FieldResolvedProps } from "./input";

// ── Inline field render ─────────────────────────────────────────────────────
//
// Used when `type: "inline"` — the render function is the sole renderer.
// No component exists in fieldMapping for this field.
// Receives resolved field props only.

// The context comes from `useField()`, so the controller bindings are always set.
export type InlineRenderContext = FieldResolvedProps &
  Required<Pick<FieldResolvedProps, "onChange" | "onBlur">>;

// ── Custom field render ─────────────────────────────────────────────────────
//
// Used when a custom mapped type (e.g. `type: "text"`) provides a `render`
// override. The registered fieldMapping component is rendered first, then
// passed as `self` — allowing the render function to wrap or decorate it
// without replacing it entirely.
//
// `self` is already wrapped in FieldProvider and ready to render.
// There are no children — custom fields do not have nested field config.
// The field's state is readable (`value`, `errorMessage`, `isDirty`, …) but not
// writable: no `onChange` / `onBlur` / `ref`. Writing belongs to the component
// (`self`); to draw and control the input yourself, use an `inline` field.

export type CustomRenderContext = Omit<FieldResolvedProps, "onChange" | "onBlur" | "ref"> & {
  self: ReactNode;
};

// ── Section field render ────────────────────────────────────────────────────
//
// Used when `type: "section"` provides a `render` override.
// `children` is the rendered output of the section's inner config,
// produced by BlueFormEngine for the section's `props.config`,
// or by the section's `props.component`.
//
// The render function acts as a layout wrapper — it does not replace
// the inner fields, only provides the container around them.

export type SectionRenderContext = FieldResolvedProps & {
  children: ReactNode;
};

// ── Array field render ──────────────────────────────────────────────────────
//
// Used when `type: "array"` provides a `render` override (or when no
// fieldMapping["array"] is registered).
//
// Receives the full useArrayField context — all array helpers and field props
// — plus `children` as the pre-rendered output of all current items via
// renderItems(). For per-item control, use `renderItem` and `items` directly
// instead of consuming `children`.

export type ArrayRenderContext = ReturnType<typeof useArrayField> & {
  children: ReactNode;
};

// ── Conditional render fn ───────────────────────────────────────────────────
//
// Narrows the render context based on the field type:
//
//   "array"   → ArrayRenderContext   (full useArrayField + children)
//   "section" → SectionRenderContext (field props + children)
//   "inline"  → InlineRenderContext  (field props only)
//   other     → CustomRenderContext  (field props + self)
//
// This conditional type ensures that `render` functions are always called
// with the correct context shape for their field type — no runtime guessing,
// no manual casting.

//   string    → any context (the component map is not statically known, e.g.
//               an untyped/dynamic map; there is no literal type to narrow on)

export type RenderFn<TFieldType extends string & keyof any = string> =
  string extends TFieldType
    ? // biome-ignore lint/suspicious/noExplicitAny: map is not statically known
      (context: any) => ReactNode
    : TFieldType extends "array"
    ? (context: ArrayRenderContext) => ReactNode
    : TFieldType extends "section"
      ? (context: SectionRenderContext) => ReactNode
      : TFieldType extends "inline"
        ? (context: InlineRenderContext) => ReactNode
        : (context: CustomRenderContext) => ReactNode;
