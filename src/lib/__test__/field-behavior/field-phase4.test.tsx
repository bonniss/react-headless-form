import { defineDynamicConfig, setupForm, useField } from "@/components";
import BlueForm from "@/components/form/BlueForm";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

const TextInput = ({ testId }: { testId?: string }) => {
  const { name, value, onChange, errorMessage } = useField();
  return (
    <>
      <input
        data-testid={testId ?? name}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {errorMessage && <span data-testid={`${name}-error`}>{errorMessage}</span>}
    </>
  );
};

describe("deps – scoped conditional re-render", () => {
  const renderForm = (withDeps: boolean) => {
    const visible = vi.fn((values: any) => values.role === "student");
    render(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ text: TextInput }}
        config={{
          role: { type: "text" },
          note: { type: "text" },
          studentId: {
            type: "text",
            visible,
            ...(withDeps ? { deps: ["role"] } : {}),
          },
        }}
      />,
    );
    return visible;
  };

  it("does not re-evaluate visible() when an unrelated field changes", () => {
    const visible = renderForm(true);
    const before = visible.mock.calls.length;

    act(() => {
      fireEvent.change(screen.getByTestId("note"), { target: { value: "x" } });
    });
    expect(visible.mock.calls.length).toBe(before);

    act(() => {
      fireEvent.change(screen.getByTestId("role"), {
        target: { value: "student" },
      });
    });
    expect(visible.mock.calls.length).toBeGreaterThan(before);
    expect(screen.getByTestId("studentId")).toBeTruthy();
  });

  // Since 0.15 deps are inferred from the values visible() reads.
  it("without deps, only changes to the paths visible() reads re-evaluate it", () => {
    const visible = renderForm(false);
    const before = visible.mock.calls.length;

    act(() => {
      fireEvent.change(screen.getByTestId("note"), { target: { value: "x" } });
    });
    expect(visible.mock.calls.length).toBe(before);

    act(() => {
      fireEvent.change(screen.getByTestId("role"), {
        target: { value: "student" },
      });
    });
    expect(visible.mock.calls.length).toBeGreaterThan(before);
    expect(screen.getByTestId("studentId")).toBeTruthy();
  });
});

describe("slots", () => {
  it("renders before/after nodes around the field", () => {
    render(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ text: TextInput }}
        config={{
          note: {
            type: "text",
            slots: {
              before: <span data-testid="before" />,
              after: <span data-testid="after" />,
            },
          },
        }}
      />,
    );
    const before = screen.getByTestId("before");
    const input = screen.getByTestId("note");
    const after = screen.getByTestId("after");
    expect(before.compareDocumentPosition(input)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(input.compareDocumentPosition(after)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("function slot receives live field value; slot components can useField()", () => {
    const Counter = () => {
      const { value } = useField();
      return <span data-testid="count">{String(value ?? "").length}</span>;
    };
    render(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ text: TextInput }}
        config={{
          note: {
            type: "text",
            slots: {
              before: <Counter />,
              after: ({ value, label }) => (
                <span data-testid="echo">
                  {label}:{String(value ?? "")}
                </span>
              ),
            },
            label: "Note",
          },
        }}
      />,
    );

    act(() => {
      fireEvent.change(screen.getByTestId("note"), {
        target: { value: "hello" },
      });
    });
    expect(screen.getByTestId("echo").textContent).toBe("Note:hello");
    expect(screen.getByTestId("count").textContent).toBe("5");
  });
});

describe("rules.pattern as string", () => {
  it.each([
    ["^\\d+$", "abc", "12"],
    ["/^abc$/i", "xyz", "ABC"],
  ])("validates with %s", async (pattern, bad, good) => {
    const onSubmit = vi.fn();
    render(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ text: TextInput }}
        onSubmit={onSubmit}
        config={{
          code: {
            type: "text",
            rules: { pattern: { value: pattern, message: "bad" } },
          },
        }}
      />,
    );

    fireEvent.change(screen.getByTestId("code"), { target: { value: bad } });
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() =>
      expect(screen.getByTestId("code-error").textContent).toBe("bad"),
    );
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByTestId("code"), { target: { value: good } });
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });
});

describe("defineDynamicConfig", () => {
  it("accepts runtime-built configs and renders them", () => {
    const [Form] = setupForm({
      renderRoot: TestRoot,
      fieldMapping: { text: TextInput },
    });

    const rows = [
      { key: "a", kind: "text", label: "Từ CSDL A" },
      { key: "b", kind: "text", label: "Từ CSDL B" },
    ];
    const config = defineDynamicConfig(
      Object.fromEntries(
        rows.map((r) => [
          r.key,
          { type: r.kind, label: { text: r.label }, rules: { pattern: "^x" } },
        ]),
      ),
    );

    render(<Form config={config} />);
    expect(screen.getByTestId("a")).toBeTruthy();
    expect(screen.getByTestId("b")).toBeTruthy();
  });
});
