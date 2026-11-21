// G5: `compute` returns the field's own type; `values` are typed by the root
// model and `ctx.scope` by the config's model (array row / nested section).
import { setupForm, defineMapping, useField, type ConditionContext } from "react-headless-form";
import type { ReactNode } from "react";

type Eq<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const assert = <T extends true>() => {};

const Text = (_: { placeholder?: string }) => { useField(); return null; };
const Root = ({ children }: { children: ReactNode }) => <form>{children}</form>;
const [Form, defineConfig] = setupForm({ renderRoot: Root, fieldMapping: defineMapping({ text: Text }) });

type Line = { qty: number; price: number; total: number };
type Invoice = { title: string; slug: string; weight: number; height: number; bmi: number; lines: Line[]; grandTotal: number };

defineConfig<Invoice>({
  slug: { type: "text", compute: (v) => (v.title ?? "").toLowerCase() },
  bmi: { type: "text", readOnly: true, compute: (v) => (v.weight && v.height ? v.weight / (v.height / 100) ** 2 : undefined) },
  grandTotal: { type: "text", compute: (v) => (v.lines ?? []).reduce((s, l) => s + l.total, 0) },
});

defineConfig<Invoice>({
  // @ts-expect-error slug is a string
  slug: { type: "text", compute: () => 1 },
});
defineConfig<Invoice>({
  // @ts-expect-error bmi is a number
  bmi: { type: "text", compute: (v) => String(v.weight) },
});
defineConfig<Invoice>({
  // @ts-expect-error unknown field on values
  slug: { type: "text", compute: (v) => v.tittle },
});

// row config: scope is the row, values the root
const lineConfig = defineConfig<Line, Invoice>({
  total: {
    type: "text",
    readOnly: true,
    compute: (values, ctx) => {
      assert<Eq<typeof ctx, ConditionContext<Line>>>();
      assert<Eq<typeof values.title, string | undefined>>();
      return (ctx.scope.qty ?? 0) * (ctx.scope.price ?? 0);
    },
  },
});
defineConfig<Line, Invoice>({
  // @ts-expect-error total is a number
  total: { type: "text", compute: (_, { scope }) => `${scope.qty}` },
});
defineConfig<Line, Invoice>({
  // @ts-expect-error scope is the row: no `title` on Line
  total: { type: "text", compute: (_, { scope }) => scope.title },
});

const App = () => <Form<Invoice> config={{ lines: { type: "array", props: { config: lineConfig } } }} />;

export { App };
