/**
 * Tests for ArrayRenderSlot
 *
 * Covers the O(n²) rendering bug where fields.map() + renderItems() inside
 * each iteration produced N*N BlueFormEngine instances instead of N.
 */
import BlueForm from "@/components/form/BlueForm";
import { useArrayField } from "@/components/form/provider";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithBlueFormProvider } from "../_utils/render-form";

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

describe("ArrayRenderSlot — render() path (no fieldMapping[array])", () => {
  it("renders the correct number of items — not O(n²)", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: "array",
            render: ({ append, renderItems }) => (
              <>
                <button type="button" onClick={() => append?.({ name: "A" })}>
                  Add
                </button>
                {renderItems?.()}
              </>
            ),
            props: {
              config: {
                name: {
                  type: "inline",
                  render: () => <div data-testid="item" />,
                },
              },
            },
          },
        }}
      />,
    );

    // Add 3 items
    fireEvent.click(screen.getByText("Add"));
    fireEvent.click(screen.getByText("Add"));
    fireEvent.click(screen.getByText("Add"));

    await waitFor(() => {
      // Should be exactly 3, not 3*3=9
      expect(screen.getAllByTestId("item")).toHaveLength(3);
    });
  });

  it("renders zero items when array is empty", () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: "array",
            render: () => {
              const { renderItems } = useArrayField();
              return <>{renderItems()}</>;
            },
            props: {
              config: {
                name: {
                  type: "inline",
                  render: () => <div data-testid="item" />,
                },
              },
            },
          },
        }}
      />,
    );

    expect(screen.queryAllByTestId("item")).toHaveLength(0);
  });

  it("passes fieldProps to render()", () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          tags: {
            type: "array",
            label: "Tags",
            render: ({ label }) => {
              return <div data-testid="label">{label}</div>;
            },
            props: {
              config: {},
            },
          },
        }}
      />,
    );

    expect(screen.getByTestId("label").textContent).toBe("Tags");
  });

  it("submit payload is correct — no duplicate values from O(n²) rendering", async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          items: {
            type: "array",
            render: () => {
              const { append, renderItems } = useArrayField();
              return (
                <>
                  <button type="button" onClick={() => append({ val: "x" })}>
                    Add
                  </button>
                  {renderItems()}
                </>
              );
            },
            props: {
              config: {
                val: {
                  type: "inline",
                  render: () => null,
                },
              },
            },
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Add"));
    fireEvent.click(screen.getByText("Add"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(submitted).toEqual({
        items: [{ val: "x" }, { val: "x" }],
      });
    });
  });
});
