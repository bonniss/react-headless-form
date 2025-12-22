import { BlueForm, HiddenField } from "@/components";
import { useArrayField } from "@/components/form/provider";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithBlueFormProvider } from "../_utils/render-form";

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

  it("supports useArrayField with renderItem inside array render()", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: "array",
            render: () => {
              const { controller, renderItem } = useArrayField()
              return (
                <>
                  <button
                    type="button"
                    onClick={() => controller.append({ name: "Alice" })}
                  >
                    Add user
                  </button>

                  {controller.fields?.map((field, index) =>
                    renderItem(field, index)
                  )}
                </>
              )
            },
            props: {
              config: {
                name: {
                  type: "inline",
                  render: () => <div data-testid="user-item" />,
                },
              },
            },
          },
        }}
      />
    )

    expect(screen.queryByTestId("user-item")).toBeNull()
    fireEvent.click(screen.getByText("Add user"))
    await waitFor(() => {
      expect(screen.getByTestId("user-item")).toBeDefined()
    })
  })

  it("shows error when array is required and empty", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: "array",
            rules: { required: "Users is required" },
            render: ({ fieldProps }) => {
              const { controller } = useArrayField()
              return (
                <>
                  {fieldProps.errorMessage && (
                    <div data-testid="error">{fieldProps.errorMessage}</div>
                  )}
                  <button data-testid="submit" type="submit">
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => controller.append({ name: "" })}
                  >
                    Add
                  </button>
                </>
              )
            },
            props: {
              config: {
                name: {
                  type: "inline",
                  render: () => <div />,
                },
              },
            },
          },
        }}
      />
    )

    fireEvent.click(screen.getByTestId("submit"))

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeDefined()
    })
  })

  it("shows error when array length is less than minLength", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: "array",
            rules: { minLength: { value: 2, message: "At least 2 users" } },
            render: ({ fieldProps }) => {
              const { controller } = useArrayField()
              return (
                <>
                  {fieldProps.errorMessage && (
                    <div data-testid="error">{fieldProps.errorMessage}</div>
                  )}
                  <button
                    type="button"
                    onClick={() => controller.append({ name: "" })}
                  >
                    Add
                  </button>
                  <button type="submit" />
                </>
              )
            },
            props: {
              config: {
                name: {
                  type: "inline",
                  render: () => <div />,
                },
              },
            },
          },
        }}
      />
    )

    fireEvent.click(screen.getByText("Add"))
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeDefined()
    })
  })

  it("shows error when array length exceeds maxLength", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: "array",
            rules: { maxLength: { value: 1, message: "Only 1 user allowed" } },
            render: ({ fieldProps }) => {
              const { controller } = useArrayField()
              return (
                <>
                  {fieldProps.errorMessage && (
                    <div data-testid="error">{fieldProps.errorMessage}</div>
                  )}
                  <button
                    type="button"
                    onClick={() => controller.append({ name: "" })}
                  >
                    Add
                  </button>
                  <button type="submit" />
                </>
              )
            },
            props: {
              config: {
                name: {
                  type: "inline",
                  render: () => <div />,
                },
              },
            },
          },
        }}
      />
    )

    fireEvent.click(screen.getByText("Add"))
    fireEvent.click(screen.getByText("Add"))
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeDefined()
    })
  })
})
