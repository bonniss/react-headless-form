/** biome-ignore-all lint/suspicious/noAssignInExpressions: <explanation> */
import BlueForm from "@/components/form/BlueForm"
import { HiddenField } from "@/components/form/field"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { renderWithBlueFormProvider } from "../_utils/render-form"

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
)

describe("BlueForm – group & ui", () => {
  it("applies defaultValue inside group namespace", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          profile: {
            type: "group",
            props: {
              config: {
                name: {
                  type: "hidden",
                  defaultValue: "Bob",
                },
              },
            },
          },
        }}
        fieldMapping={{
          hidden: HiddenField,
        }}
      />
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          name: "Bob",
        },
      })
    })
  })

  it("groups child fields under namespace", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          profile: {
            type: "group",
            props: {
              config: {
                userId: {
                  type: "hidden",
                  defaultValue: "u-123",
                },
              },
            },
          },
        }}
        fieldMapping={{
          hidden: HiddenField,
        }}
      />
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          userId: "u-123",
        },
      })
    })
  })

  it("supports nested groups", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          profile: {
            type: "group",
            props: {
              config: {
                address: {
                  type: "group",
                  props: {
                    config: {
                      city: {
                        type: "hidden",
                        defaultValue: "HN",
                      },
                    },
                  },
                },
              },
            },
          },
        }}
        fieldMapping={{
          hidden: HiddenField,
        }}
      />
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          address: {
            city: "HN",
          },
        },
      })
    })
  })

  it("applies defaultValue inside ui without namespace", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          layout: {
            type: "ui",
            props: {
              config: {
                name: {
                  type: "hidden",
                  defaultValue: "Charlie",
                },
              },
            },
          },
        }}
        fieldMapping={{
          hidden: HiddenField,
        }}
      />
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        name: "Charlie",
      })
    })
  })

  it("ui does not create namespace for child fields", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          layout: {
            type: "ui",
            props: {
              config: {
                userId: {
                  type: "hidden",
                  defaultValue: "u-123",
                },
              },
            },
          },
        }}
        fieldMapping={{
          hidden: HiddenField,
        }}
      />
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        userId: "u-123",
      })
    })
  })

  it("combines ui and group correctly", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          layout: {
            type: "ui",
            props: {
              config: {
                profile: {
                  type: "group",
                  props: {
                    config: {
                      userId: {
                        type: "hidden",
                        defaultValue: "u-123",
                      },
                    },
                  },
                },
              },
            },
          },
        }}
        fieldMapping={{
          hidden: HiddenField,
        }}
      />
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          userId: "u-123",
        },
      })
    })
  })

  it("group render does not affect namespace behavior", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          profile: {
            type: "group",
            render: ({ children }) => (
              <div data-testid="wrapper">{children}</div>
            ),
            props: {
              config: {
                userId: {
                  type: "hidden",
                  defaultValue: "u-123",
                },
              },
            },
          },
        }}
        fieldMapping={{
          hidden: HiddenField,
        }}
      />
    )

    expect(screen.getByTestId("wrapper")).toBeDefined()

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          userId: "u-123",
        },
      })
    })
  })

  it("renders a field defined with flat path 'nested.key'", () => {
    render(
      <BlueForm
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          "nested.key": {
            type: "inline",
            render: ({ fieldProps }) => <input data-testid="input" />,
          },
        }}
      />
    )

    expect(screen.getByTestId("input")).toBeTruthy()
  })

  it("maps flat path value into nested object on submit", async () => {
    const onSubmit = vi.fn()

    render(
      <BlueForm
        onSubmit={onSubmit}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{
          "nested.key": {
            type: "inline",
            render: ({ fieldProps }) => (
              <input
                data-testid="input"
                value={fieldProps.value ?? ""}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>
    )

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "hello" },
    })

    fireEvent.submit(screen.getByText("Submit").closest("form")!)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { nested: { key: "hello" } },
        expect.any(Object),
        expect.anything()
      )
    })
  })

  it("supports deep flat paths like 'a.b.c'", async () => {
    const onSubmit = vi.fn()

    render(
      <BlueForm
        onSubmit={onSubmit}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{
          "a.b.c": {
            type: "inline",
            render: ({ fieldProps }) => (
              <input
                data-testid="deep"
                value={fieldProps.value ?? ""}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>
    )

    fireEvent.change(screen.getByTestId("deep"), {
      target: { value: "deep-value" },
    })

    fireEvent.submit(screen.getByText("Submit").closest("form")!)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { a: { b: { c: "deep-value" } } },
        expect.any(Object),
        expect.anything()
      )
    })
  })

  it("merges multiple flat paths into the same nested object", async () => {
    const onSubmit = vi.fn()

    render(
      <BlueForm
        onSubmit={onSubmit}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{
          "user.name": {
            type: "inline",
            render: ({ fieldProps }) => (
              <input
                data-testid="name"
                value={fieldProps.value ?? ""}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
          "user.age": {
            type: "inline",
            render: ({ fieldProps }) => (
              <input
                data-testid="age"
                value={fieldProps.value ?? ""}
                onChange={(e) => fieldProps.onChange?.(Number(e.target.value))}
              />
            ),
          },
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>
    )

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByTestId("age"), {
      target: { value: "30" },
    })

    fireEvent.submit(screen.getByText("Submit").closest("form")!)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { user: { name: "John", age: 30 } },
        expect.any(Object),
        expect.anything()
      )
    })
  })

  it("allows flat path and group config to coexist", async () => {
    const onSubmit = vi.fn()

    render(
      <BlueForm
        onSubmit={onSubmit}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{
          profile: {
            type: "group",
            props: {
              config: {
                email: {
                  type: "inline",
                  render: ({ fieldProps }) => (
                    <input
                      data-testid="email"
                      value={fieldProps.value ?? ""}
                      onChange={(e) => fieldProps.onChange?.(e.target.value)}
                    />
                  ),
                },
              },
            },
          },
          "profile.name": {
            type: "inline",
            render: ({ fieldProps }) => (
              <input
                data-testid="name"
                value={fieldProps.value ?? ""}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>
    )

    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "a@b.com" },
    })
    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    })

    fireEvent.submit(screen.getByText("Submit").closest("form")!)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          profile: {
            email: "a@b.com",
            name: "Alice",
          },
        },
        expect.any(Object),
        expect.anything()
      )
    })
  })

  it("handles deep flat paths across multiple groups", async () => {
    const onSubmit = vi.fn()

    render(
      <BlueForm
        onSubmit={onSubmit}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{
          settings: {
            type: "group",
            props: {
              config: {
                theme: {
                  type: "group",
                  props: {
                    config: {
                      mode: {
                        type: "inline",
                        render: ({ fieldProps }) => (
                          <input
                            data-testid="mode"
                            value={fieldProps.value ?? ""}
                            onChange={(e) =>
                              fieldProps.onChange?.(e.target.value)
                            }
                          />
                        ),
                      },
                    },
                  },
                },
              },
            },
          },
          "settings.theme.color": {
            type: "inline",
            render: ({ fieldProps }) => (
              <input
                data-testid="color"
                value={fieldProps.value ?? ""}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>
    )

    fireEvent.change(screen.getByTestId("mode"), {
      target: { value: "dark" },
    })
    fireEvent.change(screen.getByTestId("color"), {
      target: { value: "blue" },
    })

    fireEvent.submit(screen.getByText("Submit").closest("form")!)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          settings: {
            theme: {
              mode: "dark",
              color: "blue",
            },
          },
        },
        expect.any(Object),
        expect.anything()
      )
    })
  })
})
