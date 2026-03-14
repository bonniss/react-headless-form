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
