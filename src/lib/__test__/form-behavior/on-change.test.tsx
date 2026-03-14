import { useField } from "@/components";
import BlueForm from "@/components/form/BlueForm";
import { HiddenField } from "@/components/form/field";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithBlueFormProvider } from "../_utils/render-form";
import { BlueFormProvider } from "@/components/form/provider";

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>{children}</form>
);

describe("BlueForm – change behavior", () => {
  it("calls onFieldChange with correct name and value for top-level field", async () => {
    const calls: any[] = [];

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFieldChange={(name, value) => {
          calls.push({ name, value });
        }}
        config={{
          name: {
            type: "inline",
            render: ({ onChange }) => (
              <button
                type="button"
                data-testid="change"
                onClick={() => {
                  onChange?.("Alice");
                }}
              >
                change
              </button>
            ),
          },
        }}
      />,
    );

    fireEvent.click(screen.getByTestId("change"));

    await waitFor(() => {
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toEqual({
        name: "name",
        value: "Alice",
      });
    });
  });

  it("calls onFieldChange with nested path and correct value", async () => {
    const calls: any[] = [];

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFieldChange={(name, value) => {
          calls.push({ name, value });
        }}
        fieldMapping={{
          group: ({ children }) => children,
        }}
        config={{
          profile: {
            type: "section",
            props: {
              nested: true,
              config: {
                userId: {
                  type: "inline",
                  render: ({ onChange }) => (
                    <button
                      type="button"
                      data-testid="change"
                      onClick={() => {
                        onChange?.("u-123");
                      }}
                    >
                      change
                    </button>
                  ),
                },
              },
            },
          },
        }}
      />,
    );

    fireEvent.click(screen.getByTestId("change"));

    await waitFor(() => {
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toEqual({
        name: "profile.userId",
        value: "u-123",
      });
    });
  });

  it("calls onFieldChange for each value change", async () => {
    const calls: any[] = [];

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFieldChange={(name, value) => {
          calls.push({ name, value });
        }}
        config={{
          name: {
            type: "inline",
            render: ({ onChange }) => (
              <>
                <button
                  type="button"
                  data-testid="a"
                  onClick={() => onChange?.("A")}
                >
                  Change to A
                </button>
                <button
                  type="button"
                  data-testid="b"
                  onClick={() => onChange?.("B")}
                >
                  Change to B
                </button>
              </>
            ),
          },
        }}
      />,
    );

    fireEvent.click(screen.getByTestId("a"));
    fireEvent.click(screen.getByTestId("b"));

    await waitFor(() => {
      expect(calls).toEqual([
        { name: "name", value: "A" },
        { name: "name", value: "B" },
      ]);
    });
  });

  it("does not emit onFormChange on mount", async () => {
    const onFormChange = vi.fn();

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={onFormChange}
        config={{
          name: {
            type: "hidden",
            defaultValue: "A",
          },
        }}
        fieldMapping={{
          hidden: HiddenField,
        }}
      />,
    );

    // wait a tick to be safe
    await new Promise((r) => setTimeout(r, 0));
    expect(onFormChange).not.toHaveBeenCalled();
  });

  it("emits full snapshot when value changes", async () => {
    let snapshot: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(values) => {
          snapshot = values;
        }}
        config={{
          name: {
            type: "inline",
            render: ({ onChange }) => {
              return (
                <button
                  type="button"
                  data-testid="change"
                  onClick={() => {
                    onChange?.("A");
                  }}
                >
                  Change to A
                </button>
              );
            },
          },
        }}
      />,
    );

    fireEvent.click(screen.getByTestId("change"));

    await waitFor(() => {
      expect(snapshot).toEqual({ name: "A" });
    });
  });

  it("emits nested snapshot when nested field changes", async () => {
    let snapshot: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(values) => {
          snapshot = values;
        }}
        config={{
          profile: {
            type: "section",
            props: {
              nested: true,
              config: {
                userId: {
                  type: "inline",
                  render: ({ onChange }: any) => {
                    return (
                      <button
                        type="button"
                        data-testid="change"
                        onClick={() => {
                          onChange?.("u-123");
                        }}
                      >
                        Change
                      </button>
                    );
                  },
                },
              },
            },
          },
        }}
        fieldMapping={{
          group: ({ children }: any) => children,
        }}
      />,
    );

    fireEvent.click(screen.getByTestId("change"));

    await waitFor(() => {
      expect(snapshot).toEqual({
        profile: {
          userId: "u-123",
        },
      });
    });
  });

  it("debounces onFormChange emissions", async () => {
    vi.useFakeTimers();

    const onFormChange = vi.fn();

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        debounceMs={300}
        onFormChange={onFormChange}
        config={{
          name: {
            type: "inline",
            render: ({ onChange }) => (
              <button type="button" onClick={() => onChange?.("A")}>
                Set A
              </button>
            ),
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Set A"));

    // immediately after change → not called
    expect(onFormChange).not.toHaveBeenCalled();

    // advance less than debounce
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onFormChange).not.toHaveBeenCalled();

    // pass debounce threshold
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(onFormChange).toHaveBeenCalledTimes(1);
    expect(onFormChange).toHaveBeenLastCalledWith(
      { name: "A" },
      expect.any(Object),
    );

    vi.useRealTimers();
  });

  it("does not reset debounce timer when onFormChange reference changes between renders", async () => {
    vi.useFakeTimers();
    const calls: { version: number; values: any }[] = [];

    const config = {
      name: {
        type: "inline" as const,
        render: ({ onChange }: any) => (
          <button type="button" onClick={() => onChange?.("A")}>
            change
          </button>
        ),
      },
    };

    const { rerender } = renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        debounceMs={300}
        onFormChange={(v) => calls.push({ version: 1, values: v })}
        config={config}
      />,
    );

    fireEvent.click(screen.getByText("change"));

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // rerender với inline callback mới — timer không được reset
    rerender(
      <BlueFormProvider
        renderRoot={(props) => (
          <form data-testid="provider-root" onSubmit={props.onSubmit}>
            {props.children}
          </form>
        )}
      >
        <BlueForm
          renderRoot={TestRoot}
          debounceMs={300}
          onFormChange={(v) => calls.push({ version: 2, values: v })}
          config={config}
        />
      </BlueFormProvider>,
    );

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // emit đúng 1 lần với callback version mới nhất
    expect(calls).toHaveLength(1);
    expect(calls[0].version).toBe(2);
    expect(calls[0].values).toEqual({ name: "A" });

    vi.useRealTimers();
  });

  it("does not reset debounce timer on unrelated re-renders", async () => {
    vi.useFakeTimers();
    const calls: any[] = [];

    const config = {
      name: {
        type: "inline" as const,
        render: ({ onChange }: any) => (
          <button type="button" onClick={() => onChange?.("A")}>
            change
          </button>
        ),
      },
    };

    const { rerender } = renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        debounceMs={300}
        onFormChange={(v) => calls.push(v)}
        config={config}
      />,
    );

    fireEvent.click(screen.getByText("change"));

    act(() => {
      vi.advanceTimersByTime(150);
    }); // nửa chừng debounce

    // re-render không liên quan (ví dụ parent state thay đổi)
    rerender(
      <BlueFormProvider
        renderRoot={(props) => (
          <form data-testid="provider-root" onSubmit={props.onSubmit}>
            {props.children}
          </form>
        )}
      >
        <BlueForm
          renderRoot={TestRoot}
          debounceMs={300}
          onFormChange={(v) => calls.push(v)}
          config={config}
        />
      </BlueFormProvider>,
    );

    act(() => {
      vi.advanceTimersByTime(150);
    }); // hoàn thành debounce

    // vẫn phải emit đúng 1 lần — timer không bị reset
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({ name: "A" });

    vi.useRealTimers();
  });

  it("collapses multiple rapid changes into one emission", async () => {
    vi.useFakeTimers();

    const snapshots: any[] = [];

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        debounceMs={200}
        onFormChange={(values) => {
          snapshots.push(values);
        }}
        config={{
          name: {
            type: "inline",
            render: ({ onChange }) => (
              <>
                <button type="button" onClick={() => onChange?.("A")}>
                  Set A
                </button>
                <button type="button" onClick={() => onChange?.("B")}>
                  Set B
                </button>
              </>
            ),
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Set A"));
    fireEvent.click(screen.getByText("Set B"));

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toEqual({ name: "B" });

    vi.useRealTimers();
  });

  it("emits immediately when explicitly set changeDebounceDelay to 0", async () => {
    const onFormChange = vi.fn();

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        debounceMs={0}
        onFormChange={onFormChange}
        config={{
          name: {
            type: "inline",
            render: ({ onChange }) => (
              <button type="button" onClick={() => onChange?.("A")}>
                Set A
              </button>
            ),
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Set A"));

    expect(onFormChange).toHaveBeenCalledTimes(1);
    expect(onFormChange).toHaveBeenCalledWith(
      { name: "A" },
      expect.any(Object),
    );
  });

  it("falls back to empty value when defaultValues is not provided", () => {
    const TextField = () => {
      const { value, onChange } = useField();

      return (
        <input
          data-testid="input"
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
      );
    };

    render(
      <BlueForm
        renderRoot={({ children }) => <form>{children}</form>}
        fieldMapping={{
          text: TextField,
        }}
        config={{
          name: {
            type: "text",
          },
        }}
      />,
    );

    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("initializes form values from defaultValues", () => {
    const TextField = () => {
      const { value, onChange } = useField();

      return (
        <input
          data-testid="input"
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
      );
    };

    render(
      <BlueForm
        renderRoot={({ children }) => <form>{children}</form>}
        fieldMapping={{
          text: TextField,
        }}
        defaultValues={{
          name: "John",
        }}
        config={{
          name: {
            type: "text",
          },
        }}
      />,
    );

    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.value).toBe("John");
  });

  it("uses formProps from Form instead of setupForm", async () => {
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

    render(
      <BlueForm
        renderRoot={({ children }) => <form>{children}</form>}
        fieldMapping={{
          text: TextField,
        }}
        formOptions={{
          mode: "onChange",
        }}
        config={{
          name: {
            type: "text",
            rules: {
              minLength: {
                value: 5,
                message: "Name must be at least 5 characters",
              },
            },
          },
        }}
      />,
    );

    const input = screen.getByTestId("input");

    fireEvent.change(input, {
      target: { value: "abcd" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeTruthy();
    });
  });
});
