import { useArrayField, useField } from "@/components";
import BlueForm from "@/components/form/BlueForm";
import type { StandardSchemaV1 } from "@/types";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as v from "valibot";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

const Root = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">submit</button>
  </form>
);

const Text = () => {
  const { path, value, onChange, errorMessage } = useField();
  return (
    <>
      <input data-testid={path} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      {errorMessage && <span data-testid={`${path}-error`}>{errorMessage}</span>}
    </>
  );
};

const Rows = () => {
  const { renderItems, errorMessage, path } = useArrayField();
  return (
    <>
      {renderItems()}
      {errorMessage && <span data-testid={`${path}-error`}>{errorMessage}</span>}
    </>
  );
};

const mapping = { text: Text, array: Rows } as any;

const submit = async () => {
  await act(async () => {
    fireEvent.click(screen.getByText("submit"));
  });
};
const type = (id: string, value: string) =>
  act(() => {
    fireEvent.change(screen.getByTestId(id), { target: { value } });
  });

describe("schema prop (Standard Schema)", () => {
  it("zod: onSubmit receives the schema output", async () => {
    const onSubmit = vi.fn();
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        schema={z.object({ name: z.string().trim().min(1), age: z.coerce.number().int() }) as any}
        config={{ name: { type: "text" }, age: { type: "text" } }}
        defaultValues={{ name: "  Ann ", age: "42" }}
        onSubmit={onSubmit}
      />,
    );
    await submit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: "Ann", age: 42 });
  });

  it("zod: shows issues as field errors and blocks submit", async () => {
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        schema={z.object({ name: z.string().min(1, "Name is required") }) as any}
        config={{ name: { type: "text" } }}
        defaultValues={{ name: "" }}
        onSubmit={onSubmit}
        onInvalid={onInvalid}
      />,
    );
    await submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalled();
    expect(screen.getByTestId("name-error").textContent).toBe("Name is required");

    // re-validates on change after submit (reValidateMode: onChange)
    type("name", "x");
    await waitFor(() => expect(screen.queryByTestId("name-error")).toBeNull());
  });

  it("valibot: nested and array errors", async () => {
    const onSubmit = vi.fn();
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        schema={
          v.object({
            profile: v.object({ city: v.pipe(v.string(), v.minLength(2, "City too short")) }),
            rows: v.pipe(
              v.array(v.object({ v: v.pipe(v.string(), v.minLength(1, "Row value required")) })),
              v.minLength(2, "At least two rows"),
            ),
          }) as any
        }
        config={{
          profile: { type: "section", props: { nested: true, config: { city: { type: "text" } } } },
          rows: { type: "array", props: { config: { v: { type: "text" } } } },
        }}
        defaultValues={{ profile: { city: "H" }, rows: [{ v: "" }] }}
        onSubmit={onSubmit}
      />,
    );
    await submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByTestId("profile.city-error").textContent).toBe("City too short");
    expect(screen.getByTestId("rows.0.v-error").textContent).toBe("Row value required");
    expect(screen.getByTestId("rows-error").textContent).toBe("At least two rows");
  });

  it("hand-written async Standard Schema", async () => {
    const onSubmit = vi.fn();
    const schema: StandardSchemaV1<{ code: string }, { code: number }> = {
      "~standard": {
        version: 1,
        vendor: "test",
        validate: async (value) => {
          const code = (value as { code: string }).code;
          await new Promise((r) => setTimeout(r, 5));
          return /^\d+$/.test(code)
            ? { value: { code: Number(code) } }
            : { issues: [{ message: "Digits only", path: [{ key: "code" }] }] };
        },
      },
    };
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        schema={schema as any}
        config={{ code: { type: "text" } }}
        defaultValues={{ code: "a1" }}
        onSubmit={onSubmit}
      />,
    );
    await submit();
    await waitFor(() => expect(screen.getByTestId("code-error").textContent).toBe("Digits only"));
    type("code", "12");
    await submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({ code: 12 });
  });

  it("onSubmitFailure receives the raw input values", async () => {
    const onSubmitFailure = vi.fn();
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        schema={z.object({ age: z.coerce.number() }) as any}
        config={{ age: { type: "text" } }}
        defaultValues={{ age: "7" }}
        onSubmit={() => {
          throw new Error("api down");
        }}
        onSubmitFailure={onSubmitFailure}
      />,
    );
    await submit();
    expect(onSubmitFailure).toHaveBeenCalled();
    expect(onSubmitFailure.mock.calls[0][1]).toEqual({ age: "7" });
  });

  it("ignores field rules (with a warning) when a schema is set", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onSubmit = vi.fn();
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        schema={z.object({ name: z.string() }) as any}
        config={{ name: { type: "text", rules: { required: "rules say required" } } }}
        defaultValues={{ name: "" }}
        onSubmit={onSubmit}
      />,
    );
    await submit();
    expect(onSubmit).toHaveBeenCalled();
    expect(warn.mock.calls.some(([m]) => String(m).includes("`schema`"))).toBe(true);
    warn.mockRestore();
  });

  it("schema wins over formOptions.resolver (with a warning)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const resolver = vi.fn(async () => ({ values: {}, errors: { name: { type: "x", message: "resolver" } } }));
    const onSubmit = vi.fn();
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        schema={z.object({ name: z.string() }) as any}
        formOptions={{ resolver } as any}
        config={{ name: { type: "text" } }}
        defaultValues={{ name: "a" }}
        onSubmit={onSubmit}
      />,
    );
    await submit();
    expect(resolver).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith({ name: "a" }, expect.anything(), expect.anything());
    expect(warn.mock.calls.some(([m]) => String(m).includes("Both `schema` and `formOptions.resolver`"))).toBe(true);
    warn.mockRestore();
  });

  it("hidden fields with shouldUnregister are not validated by the schema", async () => {
    const onSubmit = vi.fn();
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        formOptions={{ shouldUnregister: true }}
        schema={
          z.object({ kind: z.string(), vat: z.string().min(3).optional() }) as any
        }
        config={{
          kind: { type: "text" },
          vat: { type: "text", visible: (v: any) => v.kind === "company" },
        }}
        defaultValues={{ kind: "person", vat: "1" }}
        onSubmit={onSubmit}
      />,
    );
    await submit();
    expect(onSubmit.mock.calls[0][0]).toEqual({ kind: "person" });
  });
});
