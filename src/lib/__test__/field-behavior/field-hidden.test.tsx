import BlueForm from "@/components/form/BlueForm"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { renderWithBlueFormProvider } from "../_utils/render-form"

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
)

describe("Hidden field", () => {
  it("submits defaultValue for top-level hidden field (no mapping required)", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          token: {
            type: "hidden",
            defaultValue: "t-123",
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({ token: "t-123" })
    })
  })

  it("registers value using full path when inside nested section (not at root)", async () => {
    let submitted: any = null

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
                userId: {
                  type: "hidden",
                  defaultValue: "u-123",
                },
              },
            },
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          userId: "u-123",
        },
      })
      expect(submitted.userId).toBeUndefined()
    })
  })

  it("includes hidden values in the first onFormChange snapshot", async () => {
    let snapshot: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          token: {
            type: "hidden",
            defaultValue: "t-xyz",
          },
          name: {
            type: "inline",
            render: ({ fieldProps }) => (
              <button
                type="button"
                onClick={() => fieldProps.onChange?.("Alice")}
              >
                Set Name
              </button>
            ),
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Set Name"))

    await waitFor(() => {
      expect(snapshot).toEqual({
        token: "t-xyz",
        name: "Alice",
      })
    })
  })

  it("includes nested hidden values in onFormChange snapshot", async () => {
    let snapshot: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          profile: {
            type: "section",
            props: {
              nested: true,
              config: {
                userId: {
                  type: "hidden",
                  defaultValue: "u-123",
                },
                name: {
                  type: "inline",
                  render: ({ fieldProps }) => (
                    <button
                      type="button"
                      onClick={() => fieldProps.onChange?.("Bob")}
                    >
                      Set Name
                    </button>
                  ),
                },
              },
            },
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Set Name"))

    await waitFor(() => {
      expect(snapshot).toEqual({
        profile: {
          userId: "u-123",
          name: "Bob",
        },
      })
    })
  })

  it("submits complex object/array value correctly", async () => {
    let submitted: any = null

    const complex = {
      user: { id: "u-1", roles: ["admin", "editor"] },
      flags: { beta: true, score: 12.5 },
      tags: ["a", "b"],
      meta: [
        { k: "x", v: 1 },
        { k: "y", v: null },
      ],
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          payload: { type: "hidden", defaultValue: complex },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({ payload: complex })
      // đảm bảo giữ nguyên structure (deep equal)
      expect(submitted.payload.user.roles).toEqual(["admin", "editor"])
    })
  })

  it("handles null explicitly (should be present in payload)", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          note: { type: "hidden", defaultValue: null },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({ note: null })
      expect("note" in submitted).toBe(true)
    })
  })

  it("undefined defaultValue behavior is consistent (either omitted or undefined)", async () => {
    // Case này để “chốt contract” cho team.
    // RHF/engine có thể omit key, hoặc giữ key=undefined.
    // Đừng hardcode nếu team chưa thống nhất.

    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          maybe: { type: "hidden", defaultValue: undefined },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      // Chọn 1 trong 2 assertion tuỳ bạn muốn contract nào:
      // (A) omit key:
      // expect(submitted).toEqual({})
      //
      // (B) keep undefined:
      expect(submitted).toEqual({ maybe: undefined })
    })
  })
})
