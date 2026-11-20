import { setupForm, useField, useFormRef } from "@/components";
import BlueForm from "@/components/form/BlueForm";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>{children}</form>
);

const RequiredFlag = () => {
  const { name, required } = useField();
  return <span data-testid={`${name}-required`}>{String(required)}</span>;
};

describe("field config – required", () => {
  it("infers required from rules.required when omitted", () => {
    render(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ flag: RequiredFlag }}
        config={{
          a: { type: "flag", rules: { required: "x" } },
          b: { type: "flag" },
        }}
      />,
    );
    expect(screen.getByTestId("a-required").textContent).toBe("true");
    expect(screen.getByTestId("b-required").textContent).toBe("false");
  });

  it("explicit boolean overrides rules.required", () => {
    render(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ flag: RequiredFlag }}
        config={{
          a: { type: "flag", required: false, rules: { required: "x" } },
          b: { type: "flag", required: true },
        }}
      />,
    );
    expect(screen.getByTestId("a-required").textContent).toBe("false");
    expect(screen.getByTestId("b-required").textContent).toBe("true");
  });

  it("supports required as a function of form values", () => {
    render(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ flag: RequiredFlag }}
        config={{
          role: {
            type: "inline",
            render: ({ onChange }) => (
              <button type="button" onClick={() => onChange?.("student")}>
                student
              </button>
            ),
          },
          studentId: {
            type: "flag",
            required: (values: any) => values.role === "student",
          },
        }}
      />,
    );

    expect(screen.getByTestId("studentId-required").textContent).toBe("false");
    act(() => {
      fireEvent.click(screen.getByText("student"));
    });
    expect(screen.getByTestId("studentId-required").textContent).toBe("true");
  });
});

describe("useFormRef", () => {
  it("is assignable to a typed <Form ref> without casting", () => {
    type Model = { name: string };
    const [Form] = setupForm({ renderRoot: TestRoot });
    let captured: ReturnType<typeof useFormRef<Model>> | null = null;

    const App = () => {
      const ref = useFormRef<Model>();
      captured = ref;
      return (
        <Form<Model>
          ref={ref}
          defaultValues={{ name: "a" }}
          config={{ name: { type: "hidden" } }}
        />
      );
    };

    render(<App />);
    const ref = captured as unknown as ReturnType<typeof useFormRef<Model>>;
    expect(ref.current?.getValues("name")).toBe("a");
    expect(typeof ref.current?.flushChanges).toBe("function");
  });
});
