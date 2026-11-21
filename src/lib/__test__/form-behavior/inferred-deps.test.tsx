import { useArrayField, useField } from "@/components";
import BlueForm from "@/components/form/BlueForm";
import type { BlueFormRef } from "@/types/form";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
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
  const { renderItems, append } = useArrayField();
  return (
    <>
      {renderItems()}
      <button type="button" onClick={() => append({ v: "" })}>
        add
      </button>
    </>
  );
};

const type = (id: string, value: string) =>
  act(() => {
    fireEvent.change(screen.getByTestId(id), { target: { value } });
  });

const renderForm = (config: any, defaultValues: any = {}, ref?: any) =>
  render(
    <BlueForm
      ref={ref}
      renderRoot={Root}
      fieldMapping={{ text: Text, array: Rows } as any}
      config={config}
      defaultValues={defaultValues}
    />,
  );

describe("inferred deps for visible / disabled / required", () => {
  it("re-tracks after each evaluation (short-circuit conditions)", () => {
    renderForm({
      a: { type: "text" },
      b: { type: "text" },
      target: { type: "text", visible: (v: any) => v.a === "x" && v.b === "y" },
    });
    expect(screen.queryByTestId("target")).toBeNull();

    type("a", "x"); // now `b` is read too
    expect(screen.queryByTestId("target")).toBeNull();
    type("b", "y");
    expect(screen.getByTestId("target")).toBeTruthy();
    type("b", "z");
    expect(screen.queryByTestId("target")).toBeNull();
  });

  it("follows nested paths and whole-object updates", () => {
    const ref = createRef<BlueFormRef<any>>();
    renderForm(
      {
        profile: { type: "section", props: { nested: true, config: { role: { type: "text" } } } },
        studentId: { type: "text", visible: (v: any) => v.profile?.role === "student" },
      },
      { profile: { role: "" } },
      ref,
    );
    type("profile.role", "student");
    expect(screen.getByTestId("studentId")).toBeTruthy();

    act(() => ref.current!.setValue("profile", { role: "teacher" }));
    expect(screen.queryByTestId("studentId")).toBeNull();
  });

  it("depends on a whole array when reading its length", () => {
    renderForm(
      {
        rows: { type: "array", props: { config: { v: { type: "text" } } } },
        summary: { type: "text", visible: (v: any) => v.rows.length > 1 },
      },
      { rows: [{ v: "" }] },
    );
    expect(screen.queryByTestId("summary")).toBeNull();
    act(() => {
      fireEvent.click(screen.getByText("add"));
    });
    expect(screen.getByTestId("summary")).toBeTruthy();
  });

  it("re-evaluates on any change when the function enumerates all values", () => {
    const visible = vi.fn((v: any) => Object.values(v).some((x) => x === "go"));
    renderForm({ a: { type: "text" }, b: { type: "text" }, target: { type: "text", visible } });
    type("b", "go");
    expect(screen.getByTestId("target")).toBeTruthy();
  });

  it("also tracks disabled() and required()", () => {
    renderForm({
      mode: { type: "text" },
      other: { type: "text" },
      target: {
        type: "text",
        disabled: (v: any) => v.mode === "locked",
        required: (v: any) => v.mode === "strict",
      },
    });
    const target = () => screen.getByTestId("target") as HTMLInputElement;
    expect(target().disabled).toBe(false);
    type("mode", "locked");
    expect(target().disabled).toBe(true);
    type("mode", "strict");
    expect(target().disabled).toBe(false);
    expect(target().dataset.required).toBe("true");
  });

  it("declared deps override inference", () => {
    renderForm({
      a: { type: "text" },
      b: { type: "text" },
      // reads `b` but only declares `a`: a change to `b` alone is not seen
      target: { type: "text", visible: (v: any) => v.b === "y", deps: ["a"] },
    });
    type("b", "y");
    expect(screen.queryByTestId("target")).toBeNull();
    type("a", "anything");
    expect(screen.getByTestId("target")).toBeTruthy();
  });

  it("re-evaluates after reset()", () => {
    const ref = createRef<BlueFormRef<any>>();
    renderForm(
      { role: { type: "text" }, extra: { type: "text", visible: (v: any) => v.role === "x" } },
      { role: "" },
      ref,
    );
    type("role", "x");
    expect(screen.getByTestId("extra")).toBeTruthy();
    act(() => ref.current!.reset({ role: "" }));
    expect(screen.queryByTestId("extra")).toBeNull();
  });

  it("closures over non-form state still update when the parent re-renders", () => {
    const Parent = () => {
      const [show, setShow] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setShow(true)}>
            show
          </button>
          <BlueForm
            renderRoot={Root}
            fieldMapping={{ text: Text } as any}
            config={{ target: { type: "text", visible: () => show } }}
          />
        </>
      );
    };
    render(<Parent />);
    expect(screen.queryByTestId("target")).toBeNull();
    act(() => {
      fireEvent.click(screen.getByText("show"));
    });
    expect(screen.getByTestId("target")).toBeTruthy();
  });
});
