/**
 * Tests for rules mutation bug in BlueFormEngine
 *
 * Bug: engine was calling `rules[ruleType] = resolvedRule` directly on the
 * destructured reference from field config, mutating the user's config object.
 *
 * Consequences:
 *   1. Re-renders accumulate transformed rule values (resolver receives wrong input)
 *   2. React StrictMode double-invoke corrupts rules on first mount
 *   3. Shared config objects (array item config reused across instances) cross-contaminate
 */
import BlueForm from "@/components/form/BlueForm";
import { useArrayField, useField } from "@/components/form/provider";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

describe("BlueFormEngine — rules must not be mutated", () => {
  it("does not mutate the original config rules object", () => {
    const originalRules = { required: true };
    const config = {
      name: {
        type: "inline" as const,
        rules: originalRules,
        render: () => null,
      },
    };

    render(
      <BlueForm
        renderRoot={TestRoot}
        i18nConfig={{
          t: (key: any) => `t:${key}`,
          validationTranslation: { required: "validation.required" },
        }}
        config={config}
      />,
    );

    // Original rules object must be untouched after render
    expect(config.name.rules).toBe(originalRules);
    expect(config.name.rules.required).toBe(true);
  });

  it("does not mutate rules across multiple re-renders", async () => {
    const originalRules = { minLength: { value: 3, message: "Too short" } };
    const capturedRuleValues: any[] = [];

    const NameField = () => {
      // Capture what rules look like each render via useField
      // We check the config directly instead
      return <input data-testid="input" onChange={() => {}} />;
    };

    const config = {
      name: {
        type: "text" as const,
        rules: originalRules,
      },
    };

    const { rerender } = render(
      <BlueForm
        renderRoot={TestRoot}
        i18nConfig={{
          t: (key: any, params: any) => `${params?.field ?? ""}:${key}`,
          validationTranslation: { minLength: "validation.minLength" },
        }}
        fieldMapping={{ text: NameField }}
        config={config}
      />,
    );

    // Re-render multiple times
    rerender(
      <BlueForm
        renderRoot={TestRoot}
        i18nConfig={{
          t: (key: any, params: any) => `${params?.field ?? ""}:${key}`,
          validationTranslation: { minLength: "validation.minLength" },
        }}
        fieldMapping={{ text: NameField }}
        config={config}
      />,
    );

    rerender(
      <BlueForm
        renderRoot={TestRoot}
        i18nConfig={{
          t: (key: any, params: any) => `${params?.field ?? ""}:${key}`,
          validationTranslation: { minLength: "validation.minLength" },
        }}
        fieldMapping={{ text: NameField }}
        config={config}
      />,
    );

    // config.name.rules must still be the original reference
    expect(config.name.rules).toBe(originalRules);
    // and its value must still be the original shape
    expect(config.name.rules.minLength).toEqual({
      value: 3,
      message: "Too short",
    });
  });

  it("applies i18n to validation messages without touching original rules", async () => {
    let submittedError: string | undefined;

    const NameField = () => {
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

    const originalRules = { required: true };
    const config = {
      name: {
        type: "text" as const,
        label: "Username",
        rules: originalRules,
      },
    };

    render(
      <BlueForm
        renderRoot={TestRoot}
        i18nConfig={{
          t: (_key: any, params: any) =>
            params?.field ? `${params.field} is required` : "Required",
          validationTranslation: { required: "validation.required" },
        }}
        fieldMapping={{ text: NameField }}
        config={config}
        formOptions={{ mode: "onSubmit" }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeDefined();
    });

    // i18n message should appear...
    expect(screen.getByTestId("error").textContent).toContain("required");

    // ...but original config must be untouched
    expect(config.name.rules).toBe(originalRules);
    expect(config.name.rules.required).toBe(true); // still boolean, not a resolved object
  });

  it("shared config reused across array items is not cross-contaminated", async () => {
    // This is the most dangerous case: array field reuses the same `props.config`
    // object for every item instance. With the bug, instance 0 mutates the shared
    // config, and instance 1 receives already-mutated rules.
    const sharedItemConfig = {
      label: {
        type: "inline" as const,
        rules: { required: "Item label is required" },
        render: () => <div data-testid="item" />,
      },
    };

    const ArrayUI = () => {
      const { append, renderItems } = useArrayField();
      return (
        <div>
          <button type="button" onClick={() => append({ label: "" })}>
            Add
          </button>
          {renderItems()}
        </div>
      );
    };

    render(
      <BlueForm
        renderRoot={TestRoot}
        i18nConfig={{
          t: (key: any) => `t:${key}`,
          validationTranslation: { required: "validation.required" },
        }}
        fieldMapping={{ array: ArrayUI }}
        config={{
          tags: {
            type: "array" as const,
            props: { config: sharedItemConfig },
          },
        }}
      />,
    );

    // Add 3 items — each uses sharedItemConfig
    fireEvent.click(screen.getByText("Add"));
    fireEvent.click(screen.getByText("Add"));
    fireEvent.click(screen.getByText("Add"));

    await waitFor(() => {
      expect(screen.getAllByTestId("item")).toHaveLength(3);
    });

    // sharedItemConfig must still have original rules
    expect(sharedItemConfig.label.rules.required).toBe(
      "Item label is required",
    );
  });

  it("resolveRules returns original object reference when nothing changes", () => {
    // When there are no validationResolver entries, the original rules object
    // should be returned by reference (no unnecessary allocation)
    const rules = {
      required: true,
      minLength: { value: 5, message: "Too short" },
    };
    const config = {
      name: {
        type: "inline" as const,
        rules,
        render: () => null,
      },
    };

    // No validationTranslation configured → resolver is empty → rules pass through
    render(
      <BlueForm
        renderRoot={TestRoot}
        i18nConfig={{ t: (k: any) => k }}
        config={config}
      />,
    );

    expect(config.name.rules).toBe(rules);
  });
});
