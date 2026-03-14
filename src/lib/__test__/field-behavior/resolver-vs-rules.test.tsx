import BlueForm from "@/components/form/BlueForm";
import { useField } from "@/components";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithBlueFormProvider } from "../_utils/render-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

// minimal resolver mock — simulates zodResolver / yupResolver shape
function makeResolver(errors: Record<string, string> = {}) {
  return async (values: any) => {
    const fieldErrors: Record<string, any> = {};
    for (const [key, message] of Object.entries(errors)) {
      fieldErrors[key] = { type: "manual", message };
    }
    return {
      values: Object.keys(errors).length ? {} : values,
      errors: fieldErrors,
    };
  };
}

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

const InlineInput = () => {
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

describe("BlueForm – resolver vs rules", () => {
  // ─── resolver takes effect ───────────────────────────────────────────────

  it("shows error from resolver on submit", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{
          resolver: makeResolver({ name: "Name is required" }),
        }}
        config={{
          name: {
            type: "inline",
            render: () => <InlineInput />,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Name is required");
    });
  });

  it("passes submit when resolver returns no errors", async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{ resolver: makeResolver() }}
        onSubmit={(data) => {
          submitted = data;
        }}
        config={{
          name: {
            type: "inline",
            render: () => <InlineInput />,
          },
        }}
      />,
    );

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "Alice" },
    });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({ name: "Alice" });
    });
  });

  // ─── rules are disabled when resolver is present ─────────────────────────

  it("does not validate field-level rules when resolver is provided", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{
          mode: "onChange",
          resolver: makeResolver(), // resolver returns no errors
        }}
        config={{
          name: {
            type: "inline",
            rules: { required: "This field is required" },
            render: () => <InlineInput />,
          },
        }}
      />,
    );

    // leave field empty and submit — rules should NOT fire
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.queryByTestId("error")).toBeNull();
    });
  });

  it("does not show rules error on change when resolver is provided", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{
          mode: "onChange",
          resolver: makeResolver(),
        }}
        config={{
          name: {
            type: "inline",
            rules: {
              minLength: { value: 5, message: "Too short" },
            },
            render: () => <InlineInput />,
          },
        }}
      />,
    );

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "ab" }, // would trigger minLength rule
    });

    // wait a tick — no error should appear
    await waitFor(() => {
      expect(screen.queryByTestId("error")).toBeNull();
    });
  });

  it("resolver error takes precedence over rules — only resolver error shown", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{
          resolver: makeResolver({ name: "Schema error" }),
        }}
        config={{
          name: {
            type: "inline",
            rules: { required: "Rules error" },
            render: () => <InlineInput />,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Schema error");
    });

    // rules error must never appear
    expect(screen.queryByText("Rules error")).toBeNull();
  });

  // ─── rules still work when no resolver ───────────────────────────────────

  it("still validates field-level rules when no resolver is provided", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            rules: { required: "This field is required" },
            render: () => <InlineInput />,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe(
        "This field is required",
      );
    });
  });

  // ─── nested fields ────────────────────────────────────────────────────────

  it("disables rules in nested section fields when resolver is provided", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{ resolver: makeResolver() }}
        config={{
          profile: {
            type: "section",
            props: {
              nested: true,
              config: {
                username: {
                  type: "inline",
                  rules: { required: "Username required" },
                  render: () => <InlineInput />,
                },
              },
            },
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.queryByTestId("error")).toBeNull();
    });
  });

  // ─── dev warning ─────────────────────────────────────────────────────────

  it("warns in dev when resolver and rules are both present", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{ resolver: makeResolver() }}
        config={{
          name: {
            type: "inline",
            rules: { required: true },
            render: () => <InlineInput />,
          },
        }}
      />,
    );

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[react-headless-form]"),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("automatically disabled"),
    );

    warn.mockRestore();
  });

  it("does not warn when only resolver is present with no rules", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{ resolver: makeResolver() }}
        config={{
          name: {
            type: "inline",
            render: () => <InlineInput />,
          },
        }}
      />,
    );

    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining("[react-headless-form]"),
    );

    warn.mockRestore();
  });

  it("does not warn when only rules are present with no resolver", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            rules: { required: true },
            render: () => <InlineInput />,
          },
        }}
      />,
    );

    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining("[react-headless-form]"),
    );

    warn.mockRestore();
  });
});

describe("FieldProvider — hasResolver=false (no schema resolver)", () => {
  it("passes rules to useController — validation runs on submit", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            rules: { required: "Name is required" },
            render: ({ errorMessage }) => (
              <div>
                {errorMessage && <div data-testid="error">{errorMessage}</div>}
              </div>
            ),
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Name is required");
    });
  });
});

describe("FieldProvider — hasResolver=true (schema resolver provided)", () => {
  it("does not run field-level rules — schema drives validation instead", async () => {
    // field-level rules say required, but schema says it's optional
    // if rules were passed through, submit would show error —
    // if rules are suppressed, schema wins and submit succeeds
    const schema = z.object({ name: z.string().optional() });

    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{ resolver: zodResolver(schema) as any }}
        onSubmit={(v) => (submitted = v)}
        config={{
          name: {
            type: "inline",
            rules: { required: "Should be suppressed" },
            render: ({ errorMessage, onChange }) => (
              <div>
                {errorMessage && <div data-testid="error">{errorMessage}</div>}
                <button type="button" onClick={() => onChange?.(undefined)}>
                  Clear
                </button>
              </div>
            ),
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      // schema says optional → submit succeeds, no error from field-level rules
      expect(screen.queryByTestId("error")).toBeNull();
      expect(submitted).toBeDefined();
    });
  });

  it("schema error is shown when schema validation fails", async () => {
    const schema = z.object({
      name: z.string().min(1, "Name is required by schema"),
    });

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{ resolver: zodResolver(schema) as any }}
        config={{
          name: {
            type: "inline",
            defaultValue: "", // ← thêm dòng này
            render: ({ errorMessage }) => (
              <div>
                {errorMessage && <div data-testid="error">{errorMessage}</div>}
              </div>
            ),
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe(
        "Name is required by schema",
      );
    });
  });
});

// ---------------------------------------------------------------------------
// disabled — excluded from submit payload
// ---------------------------------------------------------------------------

describe("FieldProvider — disabled field", () => {
  it("disabled field is excluded from submit payload", async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          name: {
            type: "inline",
            defaultValue: "Alice",
            render: () => null,
          },
          role: {
            type: "inline",
            defaultValue: "admin",
            disabled: true,
            render: () => null,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({ name: "Alice" });
      expect(submitted.role).toBeUndefined();
    });
  });

  it("disabled via function is excluded from submit payload when condition is true", async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          locked: {
            type: "inline",
            defaultValue: true,
            render: () => null,
          },
          secret: {
            type: "inline",
            defaultValue: "hidden",
            disabled: (values: any) => Boolean(values.locked),
            render: () => null,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted.secret).toBeUndefined();
    });
  });

  it("disabled=false field is included in submit payload", async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          name: {
            type: "inline",
            defaultValue: "Bob",
            disabled: false,
            render: () => null,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({ name: "Bob" });
    });
  });
});
