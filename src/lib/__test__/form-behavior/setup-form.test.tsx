// setupForm.test.tsx
import { useField } from "@/components/form/provider/FieldProvider";
import {
  BASE_MAPPING,
  defineMapping,
  setupForm,
} from "@/components/form/setup";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

interface TestModel {
  name: string;
}

describe("setupForm", () => {
  it("works without passing any base config", async () => {
    const [Form, defineConfig] = setupForm();

    const doSubmit = vi.fn();

    const { getByText } = render(
      <Form
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        onSubmit={doSubmit}
        config={defineConfig({
          name: {
            type: "inline",
            render: () => <div data-testid="inline">OK</div>,
          },
        })}
      >
        <button type="submit">Submit</button>
      </Form>,
    );

    fireEvent.click(getByText("Submit"));

    await waitFor(() => {
      expect(doSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it("includes all built-in field types even without base config", () => {
    const [Form, defineConfig] = setupForm();

    render(
      <Form
        renderRoot={({ children }) => <form>{children}</form>}
        config={defineConfig({
          inlineField: {
            type: "inline",
            render: () => <div data-testid="inline">INLINE</div>,
          },
          uiField: {
            type: "section",
            render: () => <div data-testid="ui">UI</div>,
          },
          groupField: {
            type: "section",
            props: {
              nested: true,
              config: defineConfig({
                nested: {
                  type: "inline",
                  render: () => (
                    <div data-testid="group-inline">GROUP-INLINE</div>
                  ),
                },
              }),
            },
          },

          arrayField: {
            type: "array",
            props: {
              config: defineConfig({
                item: {
                  type: "inline",
                  render: () => (
                    <div data-testid="array-inline">ARRAY-INLINE</div>
                  ),
                },
              }),
            },
            render: ({ children }) => <div data-testid="array">{children}</div>,
          },

          hiddenField: {
            type: "hidden",
            defaultValue: "secret",
          },
        })}
      />,
    );

    expect(screen.getByTestId("inline")).toBeTruthy();
    expect(screen.getByTestId("ui")).toBeTruthy();
    expect(screen.getByTestId("group-inline")).toBeTruthy();
    expect(screen.getByTestId("array")).toBeTruthy();
  });

  it("returns a Form component and defineConfig function", () => {
    const [Form, defineConfig] = setupForm({ fieldMapping: {} as any });

    expect(Form).toBeDefined();
    expect(defineConfig).toBeDefined();
  });

  it("defineConfig returns the same config object", () => {
    const [, defineConfig] = setupForm({ fieldMapping: {} as any });

    const config = { name: { type: "text" } } as any;
    const result = defineConfig<TestModel>(config);

    expect(result).toBe(config);
  });

  it("forwards ref to BlueForm", () => {
    const [Form] = setupForm({ fieldMapping: {} as any });
    const ref = createRef<any>();

    render(
      <Form
        ref={ref}
        renderRoot={({ children }) => <form>{children}</form>}
        config={{} as any}
      />,
    );

    expect(ref.current).toBeDefined();
    expect(typeof ref.current.getValues).toBe("function");
  });

  it("includes all base field types", () => {
    const mapping = defineMapping({});

    expect(mapping).toHaveProperty("hidden");
    expect(mapping).toHaveProperty("inline");
    expect(mapping).toHaveProperty("array");
    expect(mapping).toHaveProperty("section");
  });

  it("merges user mapping on top of base mapping", () => {
    const MockField = () => null;

    const mapping = defineMapping({
      mock: MockField,
    });

    expect(mapping.mock).toBe(MockField);
  });

  it("allows user mapping to override base mapping", () => {
    const CustomHidden = () => null;

    const mapping = defineMapping({
      hidden: CustomHidden,
    });

    expect(mapping.hidden).toBe(CustomHidden);
  });

  it("does not mutate BASE_MAPPING", () => {
    const originalHidden = BASE_MAPPING.hidden;

    defineMapping({
      hidden: () => null,
    });

    expect(BASE_MAPPING.hidden).toBe(originalHidden);
  });

  it("renders fields using fieldMapping passed to setupForm", () => {
    const MockField = () => {
      return <div data-testid="mock-field">Mock Field</div>;
    };

    const [Form] = setupForm({
      fieldMapping: defineMapping({
        mock: MockField,
      }),
    });

    render(
      <Form
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          test: {
            type: "mock",
          },
        }}
      />,
    );

    expect(screen.getByTestId("mock-field")).toBeTruthy();
  });

  it("uses i18nConfig from Form props instead of setupForm", () => {
    const TextField = () => {
      const { label } = useField();
      return <div data-testid="label">{label}</div>;
    };

    const [Form] = setupForm({
      fieldMapping: defineMapping({
        text: TextField,
      }),
      i18nConfig: {
        t: () => "BASE",
      },
    });

    render(
      <Form
        i18nConfig={{
          t: () => "OVERRIDE",
        }}
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          name: {
            type: "text",
            label: "Name",
          },
        }}
      />,
    );

    // The translated label should come from Form-level i18nConfig
    expect(screen.getByText("OVERRIDE")).toBeTruthy();
  });

  it("ignores fieldMapping passed via Form props", () => {
    const BaseField = () => {
      return <div data-testid="base-field">BASE</div>;
    };

    const OverrideField = () => {
      return <div data-testid="override-field">OVERRIDE</div>;
    };

    const [Form] = setupForm({
      fieldMapping: defineMapping({
        mock: BaseField,
      }),
    });

    render(
      <Form
        // @ts-expect-error fieldMapping should not be allowed at Form level
        fieldMapping={defineMapping({
          mock: OverrideField,
        })}
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          test: {
            type: "mock",
          },
        }}
      />,
    );

    // Base mapping should be used
    expect(screen.getByTestId("base-field")).toBeTruthy();
    // Override mapping must be ignored
    expect(screen.queryByTestId("override-field")).not.toBeTruthy();
  });

  it("includes all base field types by default", () => {
    const [Form] = setupForm();

    const DummyInline = () => <div data-testid="inline" />;

    render(
      <Form
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          __inline: {
            type: "inline",
            render: () => <DummyInline />,
          },
        }}
      />,
    );

    expect(screen.getByTestId("inline")).toBeTruthy();
  });

  it("does not require defineConfig for flat keys", () => {
    type User = {
      name: string;
    };

    const [Form] = setupForm();

    render(
      <Form<User>
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          name: {
            type: "inline",
            render: () => <div data-testid="name" />,
          },
        }}
      />,
    );

    expect(screen.getByTestId("name")).toBeTruthy();
  });

  it("supports flat nested keys without defineConfig", () => {
    type User = {
      profile: {
        name: string;
      };
    };

    const [Form] = setupForm();

    render(
      <Form<User>
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          "profile.name": {
            type: "inline",
            render: () => <div data-testid="profile-name" />,
          },
        }}
      />,
    );

    expect(screen.getByTestId("profile-name")).toBeTruthy();
  });

  it("requires defineConfig for group fields", () => {
    type User = {
      profile: {
        name: string;
      };
    };

    const [Form, defineConfig] = setupForm();

    render(
      <Form<User>
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          profile: {
            type: "section",
            props: {
              nested: true,
              config: defineConfig<User["profile"]>({
                name: {
                  type: "inline",
                  render: () => <div data-testid="group-name" />,
                },
              }),
            },
          },
        }}
      />,
    );

    expect(screen.getByTestId("group-name")).toBeTruthy();
  });

  it("requires defineConfig for array fields", () => {
    type User = {
      addresses: {
        city: string;
      }[];
    };

    const [Form, defineConfig] = setupForm();

    render(
      <Form<User>
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          addresses: {
            type: "array",
            render: () => <div data-testid="array" />,
            props: {
              config: defineConfig<User["addresses"][number]>({
                city: {
                  type: "inline",
                  render: () => <div data-testid="city" />,
                },
              }),
            },
          },
        }}
      />,
    );

    expect(screen.getByTestId("array")).toBeTruthy();
  });
});

describe("children as fn", () => {
  it("renders ReactNode children như cũ (backward compat)", () => {
    const [Form] = setupForm()

    render(
      <Form
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{}}
      >
        <button type="submit" data-testid="static-btn">Submit</button>
      </Form>,
    )

    expect(screen.getByTestId("static-btn")).toBeTruthy()
  })

  it("children fn nhận đúng ExposedFormMethods và render output", () => {
    const [Form] = setupForm()

    render(
      <Form
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{}}
      >
        {({ formState, setValue, getValues, trigger, reset, resetField, setError, clearErrors, setFocus, control }) => (
          <div>
            {/* verify các methods tồn tại */}
            {typeof setValue === "function" && <span data-testid="has-setValue" />}
            {typeof getValues === "function" && <span data-testid="has-getValues" />}
            {typeof trigger === "function" && <span data-testid="has-trigger" />}
            {typeof reset === "function" && <span data-testid="has-reset" />}
            {typeof resetField === "function" && <span data-testid="has-resetField" />}
            {typeof setError === "function" && <span data-testid="has-setError" />}
            {typeof clearErrors === "function" && <span data-testid="has-clearErrors" />}
            {typeof setFocus === "function" && <span data-testid="has-setFocus" />}
            {control !== undefined && <span data-testid="has-control" />}
            {formState !== undefined && <span data-testid="has-formState" />}
            <button type="submit">Submit</button>
          </div>
        )}
      </Form>,
    )

    expect(screen.getByTestId("has-setValue")).toBeTruthy()
    expect(screen.getByTestId("has-getValues")).toBeTruthy()
    expect(screen.getByTestId("has-trigger")).toBeTruthy()
    expect(screen.getByTestId("has-reset")).toBeTruthy()
    expect(screen.getByTestId("has-resetField")).toBeTruthy()
    expect(screen.getByTestId("has-setError")).toBeTruthy()
    expect(screen.getByTestId("has-clearErrors")).toBeTruthy()
    expect(screen.getByTestId("has-setFocus")).toBeTruthy()
    expect(screen.getByTestId("has-control")).toBeTruthy()
    expect(screen.getByTestId("has-formState")).toBeTruthy()
  })

  it("children fn nhận formState.isDirty đúng khi form thay đổi", async () => {
    const [Form] = setupForm()

    render(
      <Form
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        defaultValues={{ name: "" }}
        config={{
          name: {
            type: "inline",
            render: ({ value, onChange }) => (
              <input
                data-testid="input"
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
              />
            ),
          },
        }}
      >
        {({ formState }) => (
          <button
            type="submit"
            data-testid="submit-btn"
            disabled={!formState.isDirty}
          >
            Submit
          </button>
        )}
      </Form>,
    )

    // ban đầu chưa dirty → button disabled
    expect(screen.getByTestId("submit-btn")).toHaveProperty("disabled", true)

    // type vào → dirty → button enabled
    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "Alice" },
    })

    await waitFor(() => {
      expect(screen.getByTestId("submit-btn")).not.toHaveProperty("disabled", true)
    })
  })

  it("children fn nhận formState.isSubmitting đúng", async () => {
    const [Form] = setupForm()
    let resolveSubmit!: () => void

    // onSubmit async để giữ isSubmitting = true trong khi đang submit
    const onSubmit = () =>
      new Promise<void>((resolve) => {
        resolveSubmit = resolve
      })

    render(
      <Form
        renderRoot={({ children, onSubmit: handleSubmit }) => (
          <form onSubmit={handleSubmit}>{children}</form>
        )}
        onSubmit={onSubmit}
        config={{}}
      >
        {({ formState }) => (
          <button
            type="submit"
            data-testid="submit-btn"
          >
            {formState.isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </Form>,
    )

    expect(screen.getByTestId("submit-btn").textContent).toBe("Submit")

    fireEvent.click(screen.getByTestId("submit-btn"))

    await waitFor(() => {
      expect(screen.getByTestId("submit-btn").textContent).toBe("Submitting...")
    })

    // resolve submit
    resolveSubmit()

    await waitFor(() => {
      expect(screen.getByTestId("submit-btn").textContent).toBe("Submit")
    })
  })

  it("children fn: không expose register, unregister, watch", () => {
    const [Form] = setupForm()

    render(
      <Form
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{}}
      >
        {(methods) => (
          <div>
            {"register" in methods
              ? <span data-testid="has-register" />
              : <span data-testid="no-register" />
            }
            {"unregister" in methods
              ? <span data-testid="has-unregister" />
              : <span data-testid="no-unregister" />
            }
            {"watch" in methods
              ? <span data-testid="has-watch" />
              : <span data-testid="no-watch" />
            }
            <button type="submit">Submit</button>
          </div>
        )}
      </Form>,
    )

    expect(screen.getByTestId("no-register")).toBeTruthy()
    expect(screen.getByTestId("no-unregister")).toBeTruthy()
    expect(screen.getByTestId("no-watch")).toBeTruthy()
  })
})

describe("renderRoot — ExposedFormMethods spread trực tiếp", () => {
  it("renderRoot nhận formState trực tiếp (không phải formMethods.formState)", () => {
    const [Form] = setupForm()

    render(
      <Form
        renderRoot={({ children, onSubmit, formState }) => (
          <form onSubmit={onSubmit}>
            {children}
            <span data-testid="is-dirty">
              {formState.isDirty ? "dirty" : "clean"}
            </span>
          </form>
        )}
        defaultValues={{ name: "" }}
        config={{
          name: {
            type: "inline",
            render: ({ value, onChange }) => (
              <input
                data-testid="input"
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
              />
            ),
          },
        }}
      />,
    )

    expect(screen.getByTestId("is-dirty").textContent).toBe("clean")

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "Alice" },
    })

    waitFor(() => {
      expect(screen.getByTestId("is-dirty").textContent).toBe("dirty")
    })
  })

  it("renderRoot nhận setValue và gọi được", async () => {
    const [Form] = setupForm()
    let submitted: any = null

    render(
      <Form
        renderRoot={({ children, onSubmit, setValue }) => (
          <form onSubmit={onSubmit}>
            {children}
            <button
              type="button"
              data-testid="set-btn"
              onClick={() => setValue("name", "Injected")}
            >
              Set
            </button>
            <button type="submit">Submit</button>
          </form>
        )}
        onSubmit={(data) => { submitted = data }}
        config={{
          name: {
            type: "inline",
            render: ({ value }) => (
              <span data-testid="value">{value ?? ""}</span>
            ),
          },
        }}
      />,
    )

    fireEvent.click(screen.getByTestId("set-btn"))

    await waitFor(() => {
      expect(screen.getByTestId("value").textContent).toBe("Injected")
    })

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({ name: "Injected" })
    })
  })

  it("renderRoot không có formMethods nested (breaking change confirmed)", () => {
    const [Form] = setupForm()

    render(
      <Form
        renderRoot={(args) => {
          // formMethods không còn tồn tại trong args
          expect("formMethods" in args).toBe(false)
          return <form onSubmit={args.onSubmit}>{args.children}</form>
        }}
        config={{}}
      />,
    )
  })
})
