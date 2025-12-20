import { renderWithBlueFormProvider } from "@/__test__/_utils/render-form"
import BlueForm from "@/components/form/BlueForm"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DummyField } from "../_utils/field";

describe("BlueForm config override – fieldMapping", () => {
  it("uses fieldMapping from form props over provider", () => {
    const ProviderText = () => <DummyField name="provider-text" />
    const FormText = () => <DummyField name="form-text" />

    renderWithBlueFormProvider(
      <BlueForm
        config={{
          name: { type: "text" },
        }}
        fieldMapping={{
          text: FormText,
        }}
      />,
      {
        fieldMapping: {
          text: ProviderText,
        },
      }
    )

    expect(screen.getByTestId("form-text")).toBeDefined()
    expect(screen.queryByTestId("provider-text")).toBeNull()
  })
})
