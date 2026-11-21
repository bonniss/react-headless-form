/**
 * Common real-world patterns for `visible` / `disabled` that the per-field
 * subscriptions (0.16) must keep working.
 */
import { useArrayField, useField } from "@/components";
import BlueForm from "@/components/form/BlueForm";
import type { BlueFormRef } from "@/types/form";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode, createRef, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

const Root = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">submit</button>
  </form>
);

const Text = () => {
  const { path, value, onChange, disabled } = useField();
  return (
    <input
      data-testid={path}
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const Checkbox = () => {
  const { path, value, onChange } = useField();
  return (
    <input
      type="checkbox"
      data-testid={path}
      checked={Boolean(value)}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
};

const Rows = () => {
  const { renderItems, append, remove } = useArrayField();
  return (
    <>
      {renderItems()}
      <button type="button" onClick={() => append({ kind: "", detail: "" })}>
        add
      </button>
      <button type="button" onClick={() => remove(0)}>
        remove-first
      </button>
    </>
  );
};

const mapping = { text: Text, checkbox: Checkbox, array: Rows } as any;

const type = (id: string, value: string) =>
  act(() => {
    fireEvent.change(screen.getByTestId(id), { target: { value } });
  });
const click = (id: string) =>
  act(() => {
    fireEvent.click(screen.getByTestId(id));
  });
const shown = (id: string) => screen.queryByTestId(id) !== null;

describe("visible / disabled — common usage", () => {
  it("checkbox toggles a group of fields", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          hasCompany: { type: "checkbox" },
          company: { type: "text", visible: (v: any) => v.hasCompany },
          taxId: { type: "text", visible: (v: any) => v.hasCompany },
        }}
      />,
    );
    expect(shown("company") || shown("taxId")).toBe(false);
    click("hasCompany");
    expect(shown("company") && shown("taxId")).toBe(true);
    click("hasCompany");
    expect(shown("company") || shown("taxId")).toBe(false);
  });

  it("select-like value with several options (`in` check)", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          payment: { type: "text" },
          cardNumber: { type: "text", visible: (v: any) => ["visa", "master"].includes(v.payment) },
        }}
      />,
    );
    type("payment", "visa");
    expect(shown("cardNumber")).toBe(true);
    type("payment", "master");
    expect(shown("cardNumber")).toBe(true);
    type("payment", "cash");
    expect(shown("cardNumber")).toBe(false);
  });

  it("cascading conditions (A → B → C)", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          country: { type: "text" },
          state: { type: "text", visible: (v: any) => v.country === "US" },
          county: { type: "text", visible: (v: any) => v.country === "US" && v.state === "CA" },
        }}
      />,
    );
    type("country", "US");
    expect(shown("state")).toBe(true);
    expect(shown("county")).toBe(false);
    type("state", "CA");
    expect(shown("county")).toBe(true);
    type("country", "VN");
    expect(shown("state") || shown("county")).toBe(false);
  });

  it("same field with both visible and disabled functions on different deps", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          role: { type: "text" },
          locked: { type: "checkbox" },
          note: {
            type: "text",
            visible: (v: any) => v.role === "admin",
            disabled: (v: any) => v.locked,
          },
        }}
      />,
    );
    type("role", "admin");
    const note = () => screen.getByTestId("note") as HTMLInputElement;
    expect(note().disabled).toBe(false);
    click("locked");
    expect(note().disabled).toBe(true);
    click("locked");
    expect(note().disabled).toBe(false);
  });

  it("initial values from defaultValues decide the first render", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ role: "admin", locked: true }}
        config={{
          role: { type: "text" },
          locked: { type: "checkbox" },
          note: {
            type: "text",
            visible: (v: any) => v.role === "admin",
            disabled: (v: any) => v.locked,
          },
        }}
      />,
    );
    expect((screen.getByTestId("note") as HTMLInputElement).disabled).toBe(true);
  });

  it("conditional field inside array rows reacting to a top-level value", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ detailed: false, rows: [{ kind: "", detail: "" }] }}
        config={{
          detailed: { type: "checkbox" },
          rows: {
            type: "array",
            props: {
              config: {
                kind: { type: "text" },
                detail: { type: "text", visible: (v: any) => v.detailed },
              },
            },
          },
        }}
      />,
    );
    expect(shown("rows.0.detail")).toBe(false);
    click("detailed");
    expect(shown("rows.0.detail")).toBe(true);
    // rows added later evaluate with current values
    act(() => {
      fireEvent.click(screen.getByText("add"));
    });
    expect(shown("rows.1.detail")).toBe(true);
    click("detailed");
    expect(shown("rows.0.detail") || shown("rows.1.detail")).toBe(false);
  });

  it("condition on another row's value keeps working after rows shift", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ rows: [{ kind: "a", detail: "" }, { kind: "b", detail: "" }] }}
        config={{
          rows: { type: "array", props: { config: { kind: { type: "text" }, detail: { type: "text" } } } },
          firstIsB: { type: "text", visible: (v: any) => v.rows?.[0]?.kind === "b" },
        }}
      />,
    );
    expect(shown("firstIsB")).toBe(false);
    act(() => {
      fireEvent.click(screen.getByText("remove-first"));
    });
    expect(shown("firstIsB")).toBe(true);
  });

  it("a field set programmatically from another field's effect is seen on mount", () => {
    const Auto = () => {
      const { setValue } = useFormContext();
      useEffect(() => {
        setValue("mode", "advanced");
      }, [setValue]);
      return null;
    };
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={{ ...mapping, auto: Auto }}
        config={{
          extra: { type: "text", visible: (v: any) => v.mode === "advanced" },
          mode: { type: "text" },
          auto: { type: "auto" },
        }}
      />,
    );
    expect(shown("extra")).toBe(true);
  });

  it("hidden field is excluded / disabled field is excluded on submit", async () => {
    const onSubmit = vi.fn();
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        formOptions={{ shouldUnregister: true }}
        onSubmit={onSubmit}
        defaultValues={{ kind: "person", vat: "123", name: "x" }}
        config={{
          kind: { type: "text" },
          vat: { type: "text", visible: (v: any) => v.kind === "company" },
          name: { type: "text", disabled: (v: any) => v.kind === "company" },
        }}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByText("submit"));
    });
    expect(onSubmit.mock.calls[0][0]).toEqual({ kind: "person", name: "x" });

    type("kind", "company");
    type("vat", "999");
    await act(async () => {
      fireEvent.click(screen.getByText("submit"));
    });
    expect(onSubmit.mock.calls[1][0]).toEqual({ kind: "company", vat: "999" });
  });

  it("works under StrictMode (double effects do not leak subscriptions)", () => {
    const visible = vi.fn((v: any) => v.a === "x");
    render(
      <StrictMode>
        <BlueForm
          renderRoot={Root}
          fieldMapping={mapping}
          config={{ a: { type: "text" }, b: { type: "text" }, target: { type: "text", visible } }}
        />
      </StrictMode>,
    );
    type("a", "x");
    expect(shown("target")).toBe(true);
    type("a", "y");
    expect(shown("target")).toBe(false);
    visible.mockClear();
    type("b", "1");
    expect(visible).not.toHaveBeenCalled();
  });

  it("swapping the config at runtime (static ↔ function) re-evaluates", () => {
    const Parent = () => {
      const [conditional, setConditional] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setConditional((c) => !c)}>
            swap
          </button>
          <BlueForm
            renderRoot={Root}
            fieldMapping={mapping}
            config={{
              a: { type: "text" },
              target: conditional
                ? { type: "text", visible: (v: any) => v.a === "x" }
                : { type: "text" },
            }}
          />
        </>
      );
    };
    render(<Parent />);
    expect(shown("target")).toBe(true);
    act(() => {
      fireEvent.click(screen.getByText("swap"));
    });
    expect(shown("target")).toBe(false);
    type("a", "x");
    expect(shown("target")).toBe(true);
    act(() => {
      fireEvent.click(screen.getByText("swap"));
    });
    type("a", "y");
    expect(shown("target")).toBe(true);
  });

  it("conditions on a hidden (`type: hidden`) field set via setValue", () => {
    const ref = createRef<BlueFormRef<any>>();
    render(
      <BlueForm
        ref={ref}
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          token: { type: "hidden" },
          secret: { type: "text", visible: (v: any) => Boolean(v.token) },
        }}
      />,
    );
    expect(shown("secret")).toBe(false);
    act(() => ref.current!.setValue("token", "abc"));
    expect(shown("secret")).toBe(true);
  });

  it("disabled array via function (result coerced to boolean)", () => {
    const RowsWithFlag = () => {
      const { disabled, renderItems } = useArrayField();
      return <div data-testid="rows-flag" data-disabled={String(disabled)}>{renderItems()}</div>;
    };
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={{ ...mapping, array: RowsWithFlag }}
        defaultValues={{ rows: [{ kind: "" }] }}
        config={{
          locked: { type: "checkbox" },
          rows: { type: "array", disabled: (v: any) => v.locked, props: { config: { kind: { type: "text" } } } },
        }}
      />,
    );
    expect(screen.getByTestId("rows-flag").dataset.disabled).toBe("false");
    click("locked");
    expect(screen.getByTestId("rows-flag").dataset.disabled).toBe("true");
  });

  it("per-row condition via ctx.scope (this row's value)", () => {
    const visible = vi.fn((_: any, { scope }: any) => scope?.kind === "other");
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ rows: [{ kind: "", detail: "" }, { kind: "", detail: "" }] }}
        config={{
          rows: {
            type: "array",
            props: { config: { kind: { type: "text" }, detail: { type: "text", visible } } },
          },
        }}
      />,
    );
    type("rows.1.kind", "other");
    expect(shown("rows.1.detail")).toBe(true);
    expect(shown("rows.0.detail")).toBe(false);

    // deps are precise per row: typing in row 0 does not re-run row 1's condition
    visible.mockClear();
    type("rows.0.kind", "x");
    expect(visible.mock.calls.every(([, ctx]) => ctx.path === "rows.0.detail")).toBe(true);

    // after removing row 0, the former row 1 (now row 0) keeps its own scope
    act(() => {
      fireEvent.click(screen.getByText("remove-first"));
    });
    expect(shown("rows.0.detail")).toBe(true);
  });

  it("ctx gives path / name / namespace, and scope of a nested section", () => {
    const seen: any[] = [];
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
                state: {
                  type: "text",
                  visible: (_: any, ctx: any) => {
                    seen.push({ path: ctx.path, name: ctx.name, namespace: ctx.namespace });
                    return ctx.scope?.country === "US";
                  },
                },
              },
            },
          },
        }}
      />,
    );
    expect(seen[0]).toEqual({ path: "address.state", name: "state", namespace: "address" });
    type("address.country", "US");
    expect(shown("address.state")).toBe(true);
  });

  it("top-level ctx.scope is the whole form values", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{ a: { type: "text" }, b: { type: "text", visible: (_: any, { scope }: any) => scope.a === "x" } }}
      />,
    );
    type("a", "x");
    expect(shown("b")).toBe(true);
  });
});
