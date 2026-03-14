/**
 * Tests for formOptions merge behavior between setupForm and <Form />.
 *
 * Verifies that:
 * - setupForm formOptions sets app-wide defaults
 * - <Form /> formOptions overrides setupForm defaults
 * - defaultValues always wins regardless of formOptions
 */
import { setupForm, defineMapping } from "@/components/form/setup";
import { useField } from "@/components/form/provider";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const TextField = () => {
  const { value, onChange, errorMessage } = useField();
  return (
    <div>
      <input
        data-testid="input"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {errorMessage && <div data-testid="error">{errorMessage}</div>}
    </div>
  );
};

const fieldMapping = defineMapping({ text: TextField });

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

const minLengthConfig = {
  name: {
    type: "text" as const,
    rules: {
      minLength: {
        value: 5,
        message: "Too short",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// setupForm formOptions as default
// ---------------------------------------------------------------------------

describe("formOptions — setupForm sets app-wide defaults", () => {
  it("applies mode from setupForm formOptions", async () => {
    const [Form] = setupForm({
      fieldMapping,
      formOptions: { mode: "onChange" },
    });

    render(<Form renderRoot={TestRoot} config={minLengthConfig} />);

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "abcd" },
    });

    // mode: "onChange" → error shows on change, not on submit
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Too short");
    });
  });

  it("does not show error on change when setupForm uses default mode (onTouched)", async () => {
    const [Form] = setupForm({ fieldMapping });

    render(<Form renderRoot={TestRoot} config={minLengthConfig} />);

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "abcd" },
    });

    // default mode: "onTouched" → no error yet, only after blur
    await waitFor(() => {
      expect(screen.queryByTestId("error")).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// <Form /> formOptions overrides setupForm
// ---------------------------------------------------------------------------

describe("formOptions — <Form /> overrides setupForm", () => {
  it("<Form /> formOptions.mode overrides setupForm formOptions.mode", async () => {
    // setupForm sets onSubmit, but Form overrides with onChange
    const [Form] = setupForm({
      fieldMapping,
      formOptions: { mode: "onSubmit" },
    });

    render(
      <Form
        renderRoot={TestRoot}
        formOptions={{ mode: "onChange" }}
        config={minLengthConfig}
      />,
    );

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "abcd" },
    });

    // Form-level onChange wins → error shows on change
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Too short");
    });
  });

  it("setupForm mode is used when <Form /> does not provide formOptions", async () => {
    const [Form] = setupForm({
      fieldMapping,
      formOptions: { mode: "onSubmit" },
    });

    render(<Form renderRoot={TestRoot} config={minLengthConfig} />);

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "abcd" },
    });

    // onSubmit mode → no error on change
    await waitFor(() => {
      expect(screen.queryByTestId("error")).toBeNull();
    });

    // submit → error shows
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Too short");
    });
  });
});

// ---------------------------------------------------------------------------
// defaultValues always wins
// ---------------------------------------------------------------------------

describe("formOptions — defaultValues always wins", () => {
  it("defaultValues is not overridden by formOptions in setupForm", () => {
    const [Form] = setupForm({
      fieldMapping,
      formOptions: { mode: "onChange" },
    });

    render(
      <Form
        renderRoot={TestRoot}
        defaultValues={{ name: "John" }}
        config={{
          name: { type: "text" as const },
        }}
      />,
    );

    expect((screen.getByTestId("input") as HTMLInputElement).value).toBe(
      "John",
    );
  });

  it("defaultValues is not overridden by formOptions on <Form />", () => {
    const [Form] = setupForm({ fieldMapping });

    render(
      <Form
        renderRoot={TestRoot}
        defaultValues={{ name: "Jane" }}
        formOptions={{ mode: "onChange" } as any}
        config={{
          name: { type: "text" as const },
        }}
      />,
    );

    expect((screen.getByTestId("input") as HTMLInputElement).value).toBe(
      "Jane",
    );
  });

  it("partial override — per-form formOptions only overrides specified keys, setup-level keys are preserved", async () => {
    // setup-level: mode=onSubmit, shouldFocusError=false
    // per-form: chỉ override shouldFocusError=true
    // expected: mode vẫn là onSubmit (từ setup), shouldFocusError=true (từ per-form)
    const [Form] = setupForm({
      fieldMapping,
      formOptions: {
        mode: "onSubmit",
        shouldFocusError: false,
      },
    });

    render(
      <Form
        renderRoot={TestRoot}
        formOptions={{ shouldFocusError: true }} // chỉ override 1 key
        config={minLengthConfig}
      />,
    );

    // mode=onSubmit còn nguyên từ setup → không có error khi change
    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "abcd" },
    });

    await waitFor(() => {
      expect(screen.queryByTestId("error")).toBeNull();
    });

    // submit → error xuất hiện (mode=onSubmit còn hoạt động)
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Too short");
    });
  });
});
