import { render, screen } from "@testing-library/react";
import { defineMapping, setupForm, useField } from "react-headless-form";
import { describe, expect, it } from "vitest";

function TextField() {
  const { id, label, value, onChange } = useField();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value ?? ""} onChange={onChange} />
    </div>
  );
}

const [Form, defineConfig] = setupForm({
  renderRoot: ({ children }) => <form>{children}</form>,
  fieldMapping: defineMapping({ text: TextField }),
});

const config = { email: { type: "text", label: "Email" } } as const;

describe("field ids", () => {
  it("are unique per form, so two forms with the same fields keep their labels", () => {
    render(
      <>
        <Form config={config} />
        <Form config={config} />
      </>,
    );
    const inputs = screen.getAllByLabelText("Email") as HTMLInputElement[];
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).not.toBe(inputs[1]);
    expect(inputs[0].id).not.toBe(inputs[1].id);
  });

  it("use `idPrefix` when given: <idPrefix>-<path>", () => {
    render(
      <Form
        idPrefix="signup"
        config={{
          email: { type: "text", label: "Email" },
          address: {
            type: "section",
            props: { nested: true, config: defineConfig<{ city: string }>({ city: { type: "text", label: "City" } }) },
          },
        }}
      />,
    );
    expect(screen.getByLabelText("Email").id).toBe("signup-email");
    expect(screen.getByLabelText("City").id).toBe("signup-address.city");
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
