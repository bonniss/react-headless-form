import { act, fireEvent, render, screen } from "@testing-library/react";
import { defineMapping, setupForm, useField } from "react-headless-form";
import { describe, expect, it } from "vitest";

function TextField() {
  const { path, value, onChange, readOnly } = useField();
  return <input data-testid={path} value={value ?? ""} readOnly={readOnly} onChange={(e) => onChange(e.target.value)} />;
}

function MappedArray() {
  return <div data-testid="mapped-array">mapped</div>;
}

const [Form] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>
      {children}
      <button type="submit">submit</button>
    </form>
  ),
  fieldMapping: defineMapping({ text: TextField, array: MappedArray }),
});

const type = (testId: string, value: string) =>
  act(() => {
    fireEvent.change(screen.getByTestId(testId), { target: { value } });
  });

describe("render on an array field", () => {
  it("wins over the mapped array component", () => {
    render(
      <Form
        config={{
          tags: { type: "array", render: ({ fields }) => <div data-testid="own">{fields.length}</div> },
          other: { type: "array" },
        }}
      />,
    );
    expect(screen.getByTestId("own").textContent).toBe("0");
    // a field without `render` still uses the mapped component
    expect(screen.getAllByTestId("mapped-array")).toHaveLength(1);
  });

  it("gives function slots the array-level errorMessage", async () => {
    render(
      <Form
        defaultValues={{ tags: [] }}
        config={{
          tags: {
            type: "array",
            rules: { validate: (v: unknown[]) => v.length > 0 || "Add a tag" },
            render: () => null,
            slots: { after: ({ errorMessage }) => <span data-testid="slot">{errorMessage ?? ""}</span> },
          },
        }}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByText("submit"));
    });
    expect(screen.getByTestId("slot").textContent).toBe("Add a tag");
  });
});

describe("render on a mapped field", () => {
  it("reads the live state (value, errorMessage) around `self`", async () => {
    render(
      <Form
        config={{
          email: {
            type: "text",
            rules: { required: "Email is required" },
            render: ({ self, value, errorMessage }) => (
              <div>
                {self}
                <small data-testid="count">{String(value ?? "").length}/50</small>
                <small data-testid="error">{errorMessage ?? ""}</small>
              </div>
            ),
          },
        }}
      />,
    );
    type("email", "ann@");
    expect(screen.getByTestId("count").textContent).toBe("4/50");
    type("email", "");
    await act(async () => {
      fireEvent.click(screen.getByText("submit"));
    });
    expect(screen.getByTestId("error").textContent).toBe("Email is required");
  });

  it("cannot write: no onChange / onBlur / ref (type-level)", () => {
    render(
      <Form
        config={{
          email: {
            type: "text",
            // @ts-expect-error writing belongs to the component (or an `inline` field)
            render: ({ self, onChange }) => (onChange ? null : self),
          },
        }}
      />,
    );
    expect(screen.getByTestId("email")).toBeTruthy();
  });
});

describe("form-level readOnly", () => {
  const config = { code: { type: "text", readOnly: true }, name: { type: "text" } } as const;

  it("adds read-only to every field", () => {
    render(<Form readOnly config={config} />);
    expect((screen.getByTestId("name") as HTMLInputElement).readOnly).toBe(true);
    expect((screen.getByTestId("code") as HTMLInputElement).readOnly).toBe(true);
  });

  it("readOnly={false} does not unlock a field's own readOnly", () => {
    render(<Form readOnly={false} config={config} />);
    expect((screen.getByTestId("name") as HTMLInputElement).readOnly).toBe(false);
    expect((screen.getByTestId("code") as HTMLInputElement).readOnly).toBe(true);
  });
});

describe("formOptions", () => {
  it("does not take defaultValues (use the defaultValues prop)", () => {
    render(
      // @ts-expect-error initial values go in the `defaultValues` prop, not formOptions
      <Form
        formOptions={{ defaultValues: { name: "Ann" } }}
        defaultValues={{ name: "Bob" }}
        config={{ name: { type: "text" } }}
      />,
    );
    expect((screen.getByTestId("name") as HTMLInputElement).value).toBe("Bob");
  });
});
