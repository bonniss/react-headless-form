/** biome-ignore-all lint/suspicious/noAssignInExpressions: <explanation> */
import { SkipRender, useField } from "@/components";
import BlueForm from "@/components/form/BlueForm";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithBlueFormProvider } from "../_utils/render-form";
import { createRef } from "react";

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

describe("BlueForm – inline & custom field", () => {
  it("applies defaultValue for inline field", async () => {
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
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({ name: "Alice" });
    });
  });

  it("inline field receives fieldProps and updates value", async () => {
    let snapshot: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          name: {
            type: "inline",
            render: ({ onChange }) => (
              <button type="button" onClick={() => onChange?.("Alice")}>
                Set Name
              </button>
            ),
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Set Name"));

    await waitFor(() => {
      expect(snapshot).toEqual({ name: "Alice" });
    });
  });

  it("inline field respects namespace when inside group", async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          profile: {
            type: "section",
            props: {
              nested: true,
              config: {
                name: {
                  type: "inline",
                  render: ({ onChange }: any) => (
                    <button type="button" onClick={() => onChange?.("Bob")}>
                      Set Name
                    </button>
                  ),
                },
              },
            },
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Set Name"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          name: "Bob",
        },
      });
    });
  });

  it("renders custom field from fieldMapping and submits value", async () => {
    let submitted: any = null;

    const CustomField = () => {
      const { onChange } = useField();
      return (
        <button type="button" onClick={() => onChange?.("Custom")}>
          Set Custom
        </button>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          title: {
            type: "custom",
          },
        }}
        fieldMapping={{
          custom: CustomField,
        }}
      />,
    );

    fireEvent.click(screen.getByText("Set Custom"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({
        title: "Custom",
      });
    });
  });

  it("applies defaultValue for custom field", async () => {
    let submitted: any = null;

    const CustomField = () => null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          age: {
            type: "custom",
            defaultValue: 30,
          },
        }}
        fieldMapping={{
          custom: CustomField,
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({ age: 30 });
    });
  });

  it("custom field works correctly inside ui and group", async () => {
    let submitted: any = null;

    const CustomField = () => {
      const { onChange } = useField();
      return (
        <button type="button" onClick={() => onChange?.("X")}>
          Set Value
        </button>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          layout: {
            type: "section",
            props: {
              config: {
                profile: {
                  type: "section",
                  props: {
                    nested: true,
                    config: {
                      code: {
                        type: "custom",
                      },
                    },
                  },
                },
              },
            },
          },
        }}
        fieldMapping={{
          custom: CustomField,
        }}
      />,
    );

    fireEvent.click(screen.getByText("Set Value"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          code: "X",
        },
      });
    });
  });

  it("supports inline and custom fields together", async () => {
    let submitted: any = null;

    const CustomField = () => {
      const { onChange } = useField();
      return (
        <button type="button" onClick={() => onChange?.(42)}>
          Set Age
        </button>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          name: {
            type: "inline",
            render: ({ onChange }) => (
              <button type="button" onClick={() => onChange?.("Alice")}>
                Set Name
              </button>
            ),
          },
          age: {
            type: "custom",
          },
        }}
        fieldMapping={{
          custom: CustomField,
        }}
      />,
    );

    fireEvent.click(screen.getByText("Set Name"));
    fireEvent.click(screen.getByText("Set Age"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({
        name: "Alice",
        age: 42,
      });
    });
  });

  it("skips UI for inline field but still submits defaultValue", async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          name: {
            type: "inline",
            defaultValue: "Alice",
            render: () => <SkipRender />,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({
        name: "Alice",
      });
    });
  });
});

// append vào cuối file field-inline.test.tsx

describe("BlueForm – useField fieldState props", () => {
  it("isDirty is false on mount and true after value changes", async () => {
    let dirty: boolean | undefined;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            render: ({ onChange, isDirty: d }) => {
              dirty = d;
              return (
                <button type="button" onClick={() => onChange?.("Alice")}>
                  Set
                </button>
              );
            },
          },
        }}
      />,
    );

    expect(dirty).toBe(false);

    fireEvent.click(screen.getByText("Set"));

    await waitFor(() => {
      expect(dirty).toBe(true);
    });
  });

  it("isTouched is false on mount and true after onBlur", async () => {
    let touched: boolean | undefined;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            render: ({ onBlur, isTouched: t }) => {
              touched = t;
              return (
                <input
                  data-testid="input"
                  onBlur={onBlur}
                  onChange={() => {}}
                />
              );
            },
          },
        }}
      />,
    );

    expect(touched).toBe(false);

    fireEvent.blur(screen.getByTestId("input"));

    await waitFor(() => {
      expect(touched).toBe(true);
    });
  });

  it("onBlur marks field as touched", async () => {
    let touched: boolean | undefined;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            render: ({ onBlur, isTouched: t }) => {
              touched = t;
              return (
                <input
                  data-testid="input"
                  onBlur={onBlur}
                  onChange={() => {}}
                />
              );
            },
          },
        }}
      />,
    );

    fireEvent.blur(screen.getByTestId("input"));

    await waitFor(() => {
      expect(touched).toBe(true);
    });
  });
});

describe("BlueForm – useField path and namespace", () => {
  it("path equals the field key at top level, namespace is undefined", () => {
    let capturedPath: string | undefined;
    let capturedNamespace: string | undefined;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            render: ({ path, namespace }) => {
              capturedPath = path;
              capturedNamespace = namespace;
              return null;
            },
          },
        }}
      />,
    );

    expect(capturedPath).toBe("name");
    expect(capturedNamespace).toBeUndefined();
  });

  it("path is dot-notation and namespace is section key inside nested section", () => {
    let capturedPath: string | undefined;
    let capturedNamespace: string | undefined;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          profile: {
            type: "section",
            props: {
              nested: true,
              config: {
                name: {
                  type: "inline",
                  render: ({ path, namespace }: any) => {
                    capturedPath = path;
                    capturedNamespace = namespace;
                    return null;
                  },
                },
              },
            },
          },
        }}
      />,
    );

    expect(capturedPath).toBe("profile.name");
    expect(capturedNamespace).toBe("profile");
  });
});

describe("BlueForm – useField readOnly", () => {
  it("readOnly from form-level prop is passed down to fieldProps", () => {
    let capturedReadOnly: boolean | undefined;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        readOnly
        config={{
          name: {
            type: "inline",
            render: ({ readOnly }) => {
              capturedReadOnly = readOnly;
              return null;
            },
          },
        }}
      />,
    );

    expect(capturedReadOnly).toBe(true);
  });

  it("field-level readOnly takes precedence when form is not readOnly", () => {
    let capturedReadOnly: boolean | undefined;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            readOnly: true,
            render: ({ readOnly }) => {
              capturedReadOnly = readOnly;
              return null;
            },
          },
        }}
      />,
    );

    expect(capturedReadOnly).toBe(true);
  });
});

describe("BlueForm – useField ref", () => {
  it("ref from useField attaches to the input element", () => {
    let capturedRef: React.Ref<any> | undefined;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            render: ({ ref }) => {
              capturedRef = ref;
              return (
                <input data-testid="input" ref={ref} onChange={() => {}} />
              );
            },
          },
        }}
      />,
    );

    expect(capturedRef).toBeDefined();
    expect(screen.getByTestId("input")).toBeDefined();
  });

  it("setFocus via ref scrolls to and focuses the field", async () => {
    const formRef = createRef<any>();

    renderWithBlueFormProvider(
      <BlueForm
        ref={formRef}
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            render: ({ ref }) => (
              <input data-testid="input" ref={ref} onChange={() => {}} />
            ),
          },
        }}
      />,
    );

    formRef.current?.setFocus("name");

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId("input"));
    });
  });
});
