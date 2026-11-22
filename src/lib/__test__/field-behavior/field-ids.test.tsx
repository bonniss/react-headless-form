import { render, screen } from "@testing-library/react";
import { defineMapping, setupForm, useField } from "react-headless-form";
import { describe, expect, it } from "vitest";

function TextField() {
  const { path, id, label, value, onChange } = useField();
  return (
    <label>
      {label}
      <input data-testid={path} data-field-id={id} value={value ?? ""} onChange={onChange} />
    </label>
  );
}

const [, defineConfig] = setupForm({
  renderRoot: ({ children }) => <form>{children}</form>,
  fieldMapping: defineMapping({ text: TextField }),
});
const [Form] = setupForm({
  renderRoot: ({ children }) => <form>{children}</form>,
  fieldMapping: defineMapping({ text: TextField }),
});

describe("useField().id (deprecated)", () => {
  it("is the field path: the lib does not generate DOM ids", () => {
    render(<Form config={{ email: { type: "text", label: "Email" } }} />);
    expect(screen.getByTestId("email").getAttribute("data-field-id")).toBe("email");
  });
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
