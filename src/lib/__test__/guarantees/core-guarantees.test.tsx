/**
 * Core guarantees — see CONTRIBUTING.md → "Core guarantees".
 * These tests protect the library's promises; do not weaken them to make a
 * change pass. If a guarantee must change, discuss it first.
 */
import { setupForm, useArrayField, useField } from "@/components";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

const Root = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
const FormRoot = ({ children, onSubmit }: any) => <form onSubmit={onSubmit}>{children}</form>;

describe("G1 headless: the library renders no DOM of its own", () => {
  it("renders nothing when every renderer renders nothing", () => {
    const Nothing = () => null;
    const [Form] = setupForm({ renderRoot: Root, fieldMapping: { text: Nothing } });
    const { container } = render(
      <Form<any>
        defaultValues={{ list: [{ x: "1" }] }}
        config={{
          a: { type: "text", label: "A", description: "d" },
          h: { type: "hidden" },
          i: { type: "inline", render: () => null },
          s: { type: "section", props: { nested: true, config: { b: { type: "text" } } } },
          list: { type: "array", render: ({ renderItems }) => renderItems(), props: { config: { x: { type: "text" } } } },
        }}
      />,
    );
    expect(container.innerHTML).toBe("");
  });
});

describe("G2 react-hook-form is a peer: one shared instance", () => {
  it("useFormContext() from react-hook-form sees the form inside fields", () => {
    let seen: unknown = "unset";
    let fieldControl: unknown;
    const Probe = () => {
      const ctx = useFormContext();
      const { controller } = useField();
      seen = ctx;
      fieldControl = controller.field && ctx?.control;
      return null;
    };
    const [Form] = setupForm({ renderRoot: Root, fieldMapping: { probe: Probe } });
    render(<Form<any> config={{ a: { type: "probe" } }} />);
    expect(seen).not.toBeNull();
    expect(fieldControl).toBeDefined();
  });
});

describe("G3 scoped re-renders on large forms", () => {
  const renders = new Map<string, number>();
  const mounts = new Map<string, number>();
  const Counted = () => {
    const { path: name, value, onChange } = useField();
    renders.set(name, (renders.get(name) ?? 0) + 1);
    useEffect(() => {
      mounts.set(name, (mounts.get(name) ?? 0) + 1);
    }, [name]);
    return <input data-testid={name} value={value ?? ""} onChange={e => onChange(e.target.value)} />;
  };
  const [Form] = setupForm({ renderRoot: FormRoot, fieldMapping: { text: Counted } });
  const reset = () => {
    renders.clear();
    mounts.clear();
  };
  const othersRerendered = (except: string[]) =>
    [...renders.entries()].filter(([k, n]) => !except.includes(k) && n > 0).map(([k]) => k);

  it("typing in one of 300 plain fields re-renders only that field", () => {
    const config = Object.fromEntries(Array.from({ length: 300 }, (_, i) => [`f${i}`, { type: "text" as const }]));
    render(<Form<any> config={config} />);
    reset();
    act(() => {
      fireEvent.change(screen.getByTestId("f0"), { target: { value: "x" } });
    });
    expect(renders.get("f0")).toBeGreaterThan(0);
    expect(othersRerendered(["f0"])).toEqual([]);
  });

  it("with `deps` on every conditional field, unrelated typing re-renders nothing else", () => {
    const visible = vi.fn((v: any) => v.f0 === "show");
    const config: Record<string, any> = Object.fromEntries(
      Array.from({ length: 200 }, (_, i) => [`f${i}`, { type: "text" }]),
    );
    for (let i = 0; i < 40; i++) config[`c${i}`] = { type: "text", visible, deps: ["f0"] };
    render(<Form<any> config={config} />);
    reset();
    visible.mockClear();

    act(() => {
      fireEvent.change(screen.getByTestId("f1"), { target: { value: "x" } });
    });
    expect(othersRerendered(["f1"])).toEqual([]);
    expect(visible).not.toHaveBeenCalled();

    act(() => {
      fireEvent.change(screen.getByTestId("f0"), { target: { value: "show" } });
    });
    expect(screen.getByTestId("c0")).toBeTruthy();
  });

  it("without `deps`, unrelated typing re-renders nothing else (deps are inferred)", () => {
    const visible = vi.fn((v: any) => v.f0 === "show");
    const config: Record<string, any> = Object.fromEntries(
      Array.from({ length: 200 }, (_, i) => [`f${i}`, { type: "text" }]),
    );
    for (let i = 0; i < 40; i++) config[`c${i}`] = { type: "text", visible };
    render(<Form<any> config={config} />);
    reset();
    visible.mockClear();

    act(() => {
      fireEvent.change(screen.getByTestId("f1"), { target: { value: "x" } });
    });
    expect(othersRerendered(["f1"])).toEqual([]);
    expect(visible).not.toHaveBeenCalled();

    act(() => {
      fireEvent.change(screen.getByTestId("f0"), { target: { value: "show" } });
    });
    expect(screen.getByTestId("c39")).toBeTruthy();
  });

  it("typing in a dependency re-renders only fields whose condition result changes", () => {
    const config: Record<string, any> = Object.fromEntries(
      Array.from({ length: 200 }, (_, i) => [`f${i}`, { type: "text" }]),
    );
    for (let i = 0; i < 40; i++) {
      config[`c${i}`] = { type: "text", visible: (v: any) => String(v.f0).startsWith("show") };
    }
    render(<Form<any> defaultValues={{ f0: "show" }} config={config} />);

    // f0 changes, but every condition stays true → nothing else renders
    reset();
    act(() => {
      fireEvent.change(screen.getByTestId("f0"), { target: { value: "show more" } });
    });
    expect(othersRerendered(["f0"])).toEqual([]);

    // condition flips → only the 40 conditional fields are affected
    reset();
    act(() => {
      fireEvent.change(screen.getByTestId("f0"), { target: { value: "hide" } });
    });
    expect(othersRerendered(["f0"])).toEqual([]);
    expect(screen.queryByTestId("c0")).toBeNull();
  });

  it("appending to a 200-row array does not re-render existing rows", () => {
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
    const [ArrForm] = setupForm({ renderRoot: FormRoot, fieldMapping: { text: Counted, array: Rows } });
    render(
      <ArrForm<any>
        defaultValues={{ rows: Array.from({ length: 200 }, () => ({ v: "" })) }}
        config={{ rows: { type: "array", props: { config: { v: { type: "text" } } } } }}
      />,
    );
    reset();
    act(() => {
      fireEvent.click(screen.getByText("add"));
    });
    expect(othersRerendered(["rows.200.v"])).toEqual([]);
  });

  it("appending to a 200-row array does not remount existing rows", () => {
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
    const [ArrForm] = setupForm({ renderRoot: FormRoot, fieldMapping: { text: Counted, array: Rows } });
    render(
      <ArrForm<any>
        defaultValues={{ rows: Array.from({ length: 200 }, () => ({ v: "" })) }}
        config={{ rows: { type: "array", props: { config: { v: { type: "text" } } } } }}
      />,
    );
    reset();
    act(() => {
      fireEvent.click(screen.getByText("add"));
    });
    expect(mounts.size).toBe(1);
    expect(mounts.has("rows.200.v")).toBe(true);
  });
});

describe("G4 clear errors outside a form", () => {
  it("useField() outside <Form> throws a descriptive error", () => {
    const Bad = () => {
      useField();
      return null;
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(/\[react-headless-form\] useField\(\) must be called inside/);
    spy.mockRestore();
  });
});

describe("G8 stable public API", () => {
  // Changing this list is a public API change: removals/renames need a deprecation
  // first and a `!` / BREAKING CHANGE commit. Update the snapshot deliberately.
  it("runtime exports", async () => {
    const lib = await import("@/index");
    expect(Object.keys(lib).sort()).toMatchInlineSnapshot(`
      [
        "Controller",
        "SkipRender",
        "defineDynamicConfig",
        "defineMapping",
        "get",
        "set",
        "setupForm",
        "useArrayField",
        "useController",
        "useField",
        "useFieldArray",
        "useForm",
        "useFormContext",
        "useFormRef",
        "useFormState",
        "useWatch",
      ]
    `);
  });
});
