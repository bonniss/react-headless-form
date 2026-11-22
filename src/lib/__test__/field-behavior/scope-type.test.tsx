import { defineMapping, setupForm, useField } from "react-headless-form";
import { describe, expect, it } from "vitest";

function TextField() {
  const { value, onChange } = useField();
  return <input value={value ?? ""} onChange={onChange} />;
}

const [, defineConfig] = setupForm({
  renderRoot: ({ children }) => <form>{children}</form>,
  fieldMapping: defineMapping({ text: TextField }),
});
describe("ctx.scope type", () => {
  it("includes undefined (a removed row has no scope)", () => {
    defineConfig<{ rows: { qty: string; total?: number }[] }>({
      rows: {
        type: "section",
        props: {
          config: {
            // @ts-expect-error scope may be undefined: use scope?.qty
            total: { type: "text", compute: (_, { scope }) => Number(scope.qty) },
          },
        },
      },
    });
    expect(true).toBe(true);
  });
});
