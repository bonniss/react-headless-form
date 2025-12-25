import { setupForm } from "@/components"
import { webFormRoot } from "@/components/platform"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

describe("Form with webFormRoot", () => {
  it("renders form using webFormRoot", () => {
    const [Form] = setupForm({
      renderRoot: webFormRoot({
        "data-testid": "form",
        className: "web-form",
      }),
    })

    render(
      <Form config={{}} onSubmit={vi.fn()}>
        <button type="submit">Submit</button>
      </Form>
    )

    const form = screen.getByTestId("form")

    expect(form.tagName).toBe("FORM")
    expect(form).toHaveClass("web-form")
  })

  it("submits form through webFormRoot", async () => {
    const handleSubmit = vi.fn()

    const [Form] = setupForm({
      renderRoot: webFormRoot({
        "data-testid": "form",
      }),
    })

    render(
      <Form config={{}} onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </Form>
    )

    fireEvent.submit(screen.getByTestId("form"))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it("renders children inside webFormRoot", () => {
    const [Form] = setupForm({
      renderRoot: webFormRoot(),
    })

    render(
      <Form config={{}} onSubmit={vi.fn()}>
        <div>Inner Content</div>
      </Form>
    )

    expect(screen.getByText("Inner Content")).toBeInTheDocument()
  })

  it("ignores onSubmit passed via nativeProps", async () => {
    const nativeOnSubmit = vi.fn()
    const formOnSubmit = vi.fn()

    const [Form] = setupForm({
      renderRoot: webFormRoot({
        // @ts-expect-error — intentionally invalid
        onSubmit: nativeOnSubmit,
        "data-testid": "form",
      }),
    })

    render(
      <Form config={{}} onSubmit={formOnSubmit}>
        <button type="submit">Submit</button>
      </Form>
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(formOnSubmit).toHaveBeenCalledTimes(1)
    })

    expect(nativeOnSubmit).not.toHaveBeenCalled()
  })

  it("ignores children passed via nativeProps", () => {
    const [Form] = setupForm({
      renderRoot: webFormRoot({
        // @ts-expect-error — intentionally invalid
        children: <div>SHOULD NOT RENDER</div>,
      }),
    })

    render(
      <Form config={{}} onSubmit={vi.fn()}>
        <div>REAL CHILDREN</div>
      </Form>
    )

    expect(screen.getByText("REAL CHILDREN")).toBeInTheDocument()
    expect(screen.queryByText("SHOULD NOT RENDER")).not.toBeInTheDocument()
  })
})
