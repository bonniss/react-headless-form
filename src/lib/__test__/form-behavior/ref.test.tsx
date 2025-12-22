import { BlueForm } from "@/components"
import { createRef } from "react"
import { describe, expect, it } from "vitest"
import { renderWithBlueFormProvider } from "../_utils/render-form"

const TestRoot = ({ children }: any) => <form>{children}</form>

describe("BlueForm – ref behavior", () => {
  it("exposes react-hook-form methods via ref", () => {
    const ref = createRef<any>()

    renderWithBlueFormProvider(
      <BlueForm
        ref={ref}
        renderRoot={TestRoot}
        defaultValues={{ name: "John" }}
        config={{
          name: {
            type: "hidden",
          },
        }}
      />
    )

    expect(ref.current).toBeDefined()
    expect(typeof ref.current.getValues).toBe("function")
    expect(ref.current.getValues()).toEqual({ name: "John" })
  })

  it("updates form state when setValue is called via ref", async () => {
    const ref = createRef<any>()
    let snapshot: any = null

    renderWithBlueFormProvider(
      <BlueForm
        ref={ref}
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          name: {
            type: "hidden",
          },
        }}
      />
    )

    ref.current.setValue("name", "Alice")

    expect(ref.current.getValues()).toEqual({ name: "Alice" })
    expect(snapshot).toEqual({ name: "Alice" })
  })
})
