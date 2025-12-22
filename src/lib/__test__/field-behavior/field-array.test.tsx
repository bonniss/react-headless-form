import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { BlueForm, HiddenField } from "@/components"
import { renderWithBlueFormProvider } from "../_utils/render-form"
import { useArrayField } from "@/components/form/provider"

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
)

describe("BlueForm - field array", () => {
  it("ignores defaultValue defined on array field config", async () => {
    let submitted: any = null
    const ArrayUI = () => {
      const { controller } = useArrayField()
      return (
        <>
          <button type="button" onClick={() => controller.append({})}>
            Add
          </button>
          <button
            type="button"
            onClick={() => controller.update(0, { name: "Alice" })}
          >
            Set Name
          </button>
        </>
      )
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          users: {
            type: "array",
            defaultValue: [{ name: "Default" }],
            props: {
              config: {
                name: {
                  type: "hidden",
                },
              },
            },
          },
        }}
        fieldMapping={{
          array: ArrayUI,
          hidden: HiddenField,
        }}
      />
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        users: [],
      })
    })
  })

  it("throws error when array field has no mapping and no render", () => {
    expect(() =>
      renderWithBlueFormProvider(
        <BlueForm
          renderRoot={TestRoot}
          config={{
            users: {
              type: "array",
              props: {
                config: {},
              },
            },
          }}
        />
      )
    ).toThrow(/array/i)
  })

  it("renders array using render() when no mapping is provided", () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: "array",
            render: () => <div data-testid="custom-array" />,
            props: {
              config: {},
            },
          },
        }}
      />
    )

    expect(screen.getByTestId("custom-array")).toBeDefined()
  })

  it("appends item to array and updates form values", async () => {
    let snapshot: any = null

    const ArrayUI = () => {
      const { controller } = useArrayField()
      return (
        <button type="button" onClick={() => controller.append({})}>
          Add
        </button>
      )
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          users: {
            type: "array",
            props: {
              config: {},
            },
          },
        }}
        fieldMapping={{
          array: ArrayUI,
        }}
      />
    )

    fireEvent.click(screen.getByText("Add"))

    await waitFor(() => {
      expect(snapshot).toEqual({ users: [{}] })
    })
  })

  it("updates array item value correctly", async () => {
    let snapshot: any = null

    const ArrayUI = () => {
      const { controller } = useArrayField()
      return (
        <>
          <button type="button" onClick={() => controller.append({})}>
            Add
          </button>
          <button
            type="button"
            onClick={() => controller.update(0, { name: "Alice" })}
          >
            Set Name
          </button>
        </>
      )
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          users: {
            type: "array",
            props: {
              config: {},
            },
          },
        }}
        fieldMapping={{
          array: ArrayUI,
        }}
      />
    )

    fireEvent.click(screen.getByText("Add"))
    fireEvent.click(screen.getByText("Set Name"))

    await waitFor(() => {
      expect(snapshot).toEqual({
        users: [{ name: "Alice" }],
      })
    })
  })

  it("removes array item and updates form values", async () => {
    let snapshot: any = null

    const ArrayUI = () => {
      const { controller } = useArrayField()
      return (
        <>
          <button type="button" onClick={() => controller.append({})}>
            Add
          </button>
          <button type="button" onClick={() => controller.remove(0)}>
            Remove
          </button>
        </>
      )
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          users: {
            type: "array",
            props: {
              config: {},
            },
          },
        }}
        fieldMapping={{
          array: ArrayUI,
        }}
      />
    )

    fireEvent.click(screen.getByText("Add"))
    fireEvent.click(screen.getByText("Remove"))

    await waitFor(() => {
      expect(snapshot).toEqual({ users: [] })
    })
  })

  it("submits array payload correctly", async () => {
    let submitted: any = null

    const ArrayUI = () => {
      const { controller } = useArrayField()
      return (
        <button
          type="button"
          onClick={() => controller.append({ name: "Bob" })}
        >
          Add
        </button>
      )
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          users: {
            type: "array",
            props: {
              config: {},
            },
          },
        }}
        fieldMapping={{
          array: ArrayUI,
        }}
      />
    )

    fireEvent.click(screen.getByText("Add"))
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        users: [{ name: "Bob" }],
      })
    })
  })
})
