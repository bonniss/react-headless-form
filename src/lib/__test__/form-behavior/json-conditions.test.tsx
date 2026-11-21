import { defineDynamicConfig, useArrayField, useField } from "@/components";
import BlueForm from "@/components/form/BlueForm";
import { evaluateCondition } from "@/components/helper/condition";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const Root = ({ children }: any) => <form>{children}</form>;
const Text = () => {
  const { path, value, onChange, disabled, required } = useField();
  return (
    <input
      data-testid={path}
      data-required={String(required)}
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
const Rows = () => {
  const { renderItems, remove } = useArrayField();
  return (
    <>
      {renderItems()}
      <button type="button" onClick={() => remove(0)}>
        remove-first
      </button>
    </>
  );
};
const mapping = { text: Text, array: Rows } as any;
const type = (id: string, value: string) =>
  act(() => {
    fireEvent.change(screen.getByTestId(id), { target: { value } });
  });
const shown = (id: string) => screen.queryByTestId(id) !== null;

describe("evaluateCondition (operators)", () => {
  const scope = { s: "abc", n: 5, ns: "5", e: "", arr: [], list: [1], b: true, nested: { x: 1 } };
  const ev = (c: any) => evaluateCondition(c, scope, scope);

  it.each([
    [{ when: "s", eq: "abc" }, true],
    [{ when: "s", eq: "x" }, false],
    [{ when: "s", neq: "x" }, true],
    [{ when: "s", in: ["x", "abc"] }, true],
    [{ when: "s", notIn: ["abc"] }, false],
    [{ when: "e", empty: true }, true],
    [{ when: "arr", empty: true }, true],
    [{ when: "missing", empty: true }, true],
    [{ when: "list", notEmpty: true }, true],
    [{ when: "s", notEmpty: true }, true],
    [{ when: "n", gt: 4 }, true],
    [{ when: "n", gte: 5, lt: 6 }, true],
    [{ when: "n", lte: 4 }, false],
    [{ when: "ns", gt: 4 }, true], // numeric strings from text inputs
    [{ when: "e", gt: -1 }, false], // "" is not a number
    [{ when: "missing", lt: 1 }, false],
    [{ when: "s", matches: "^a" }, true],
    [{ when: "s", matches: "/^A/i" }, true],
    [{ when: "n", matches: "5" }, false], // only strings match
    [{ when: "b" }, true], // no operator: truthy
    [{ when: "e" }, false],
    [{ when: "nested.x", eq: 1 }, true],
    [{ and: [{ when: "n", gt: 1 }, { when: "s", eq: "abc" }] }, true],
    [{ and: [{ when: "n", gt: 1 }, { when: "s", eq: "x" }] }, false],
    [{ or: [{ when: "s", eq: "x" }, { when: "b" }] }, true],
    [{ not: { when: "b" } }, false],
    [{ or: [{ and: [{ when: "b" }, { not: { when: "e" } }] }, { when: "s", eq: "x" }] }, true],
    [{ and: [] }, true],
    [{ or: [] }, false],
  ])("%j → %s", (condition, expected) => {
    expect(ev(condition)).toBe(expected);
  });

  it("from: root reads the root values, otherwise the scope", () => {
    expect(evaluateCondition({ when: "role", from: "root", eq: "admin" }, { role: "admin" }, {})).toBe(true);
    expect(evaluateCondition({ when: "role", eq: "admin" }, { role: "admin" }, {})).toBe(false);
  });

  it("throws descriptive errors for invalid conditions", () => {
    expect(() => ev({ foo: 1 })).toThrow(/\[react-headless-form\] Invalid condition/);
    expect(() => ev({ when: "s", like: "a" })).toThrow(
      /\[react-headless-form\] Unknown condition operator "like"/,
    );
  });
});

describe("JSON conditions in forms", () => {
  it("visible / disabled / required from JSON", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          role: { type: "text" },
          status: { type: "text" },
          discount: { type: "text", visible: { when: "role", eq: "member" } },
          notes: { type: "text", disabled: { or: [{ when: "status", in: ["paid", "shipped"] }] } },
          vat: { type: "text", required: { when: "role", eq: "company" } },
        }}
      />,
    );
    expect(shown("discount")).toBe(false);
    type("role", "member");
    expect(shown("discount")).toBe(true);
    type("status", "paid");
    expect((screen.getByTestId("notes") as HTMLInputElement).disabled).toBe(true);
    type("role", "company");
    expect(screen.getByTestId("vat").dataset.required).toBe("true");
  });

  it("relative to the array row, with from: root", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ role: "", rows: [{ kind: "", detail: "" }, { kind: "", detail: "" }] }}
        config={{
          role: { type: "text" },
          rows: {
            type: "array",
            props: {
              config: {
                kind: { type: "text" },
                detail: { type: "text", visible: { when: "kind", eq: "other" } },
                adminNote: { type: "text", visible: { when: "role", from: "root", eq: "admin" } },
              },
            },
          },
        }}
      />,
    );
    type("rows.1.kind", "other");
    expect(shown("rows.1.detail")).toBe(true);
    expect(shown("rows.0.detail")).toBe(false);
    expect(shown("rows.0.adminNote")).toBe(false);
    type("role", "admin");
    expect(shown("rows.0.adminNote") && shown("rows.1.adminNote")).toBe(true);
    act(() => {
      fireEvent.click(screen.getByText("remove-first"));
    });
    expect(shown("rows.0.detail")).toBe(true);
  });

  it("relative to a nested section", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          address: {
            type: "section",
            props: {
              nested: true,
              config: {
                country: { type: "text" },
                state: { type: "text", visible: { when: "country", eq: "US" } },
              },
            },
          },
        }}
      />,
    );
    type("address.country", "US");
    expect(shown("address.state")).toBe(true);
  });

  it("tracks precise deps: unrelated typing re-renders nothing else", () => {
    const renders = vi.fn();
    const Counted = () => {
      const { path, value, onChange } = useField();
      renders(path);
      return <input data-testid={path} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    };
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={{ text: Counted } as any}
        defaultValues={{ role: "member" }}
        config={{
          role: { type: "text" },
          other: { type: "text" },
          discount: { type: "text", visible: { when: "role", eq: "member" } },
        }}
      />,
    );
    renders.mockClear();
    type("other", "x");
    expect(renders.mock.calls.map(([p]) => p)).toEqual(["other"]);
    renders.mockClear();
    type("role", "guest");
    expect(shown("discount")).toBe(false);
  });

  it("configs from JSON (database) through defineDynamicConfig", () => {
    const stored = JSON.stringify({
      plan: { type: "text" },
      seats: {
        type: "text",
        visible: { and: [{ when: "plan", in: ["team", "business"] }, { not: { when: "plan", eq: "free" } }] },
      },
    });
    render(<BlueForm renderRoot={Root} fieldMapping={mapping} config={defineDynamicConfig(JSON.parse(stored))} />);
    expect(shown("seats")).toBe(false);
    type("plan", "team");
    expect(shown("seats")).toBe(true);
  });

  it("an invalid condition surfaces a descriptive error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <BlueForm
          renderRoot={Root}
          fieldMapping={mapping}
          config={{ a: { type: "text", visible: { bogus: 1 } as any } }}
        />,
      ),
    ).toThrow(/\[react-headless-form\] Invalid condition/);
    spy.mockRestore();
  });
});
