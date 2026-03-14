/**
 * Tests for engine-owned field type behavior.
 *
 * Covers:
 * - built-in types (hidden, inline, section) cannot be overridden via fieldMapping
 * - render prop has no effect on engine-owned types
 */
import BlueForm from "@/components/form/BlueForm";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithBlueFormProvider } from "../_utils/render-form";

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

// ---------------------------------------------------------------------------
// hidden — engine-owned
// ---------------------------------------------------------------------------

describe("BlueFormEngine — hidden is engine-owned", () => {
  it("fieldMapping cannot override hidden", async () => {
    let submitted: any = null;

    const FakeHidden = () => <div data-testid="fake-hidden" />;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        fieldMapping={{ hidden: FakeHidden } as any}
        config={{
          token: { type: "hidden", defaultValue: "secret" },
        }}
      />,
    );

    expect(screen.queryByTestId("fake-hidden")).toBeNull();

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({ token: "secret" });
    });
  });

  it("render on hidden field has no effect", async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          token: {
            type: "hidden",
            defaultValue: "abc",
            render: (() => <div data-testid="should-not-render" />) as any,
          },
        }}
      />,
    );

    expect(screen.queryByTestId("should-not-render")).toBeNull();

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({ token: "abc" });
    });
  });
});

// ---------------------------------------------------------------------------
// inline — engine-owned
// ---------------------------------------------------------------------------

describe("BlueFormEngine — inline is engine-owned", () => {
  it("fieldMapping cannot override inline", () => {
    const FakeInline = () => <div data-testid="fake-inline" />;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ inline: FakeInline } as any}
        config={{
          name: {
            type: "inline",
            render: () => <div data-testid="real-inline" />,
          },
        }}
      />,
    );

    expect(screen.queryByTestId("fake-inline")).toBeNull();
    expect(screen.getByTestId("real-inline")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// section — engine-owned
// ---------------------------------------------------------------------------

describe("BlueFormEngine — section is engine-owned", () => {
  it("fieldMapping cannot override section", async () => {
    let submitted: any = null;

    const FakeSection = () => <div data-testid="fake-section" />;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        fieldMapping={{ section: FakeSection } as any}
        config={{
          profile: {
            type: "section",
            props: {
              nested: true,
              config: {
                name: {
                  type: "hidden",
                  defaultValue: "Alice",
                },
              },
            },
          },
        }}
      />,
    );

    // FakeSection should not render
    expect(screen.queryByTestId("fake-section")).toBeNull();

    fireEvent.click(screen.getByText("Submit"));

    // section still works correctly via engine
    await waitFor(() => {
      expect(submitted).toEqual({ profile: { name: "Alice" } });
    });
  });
});
