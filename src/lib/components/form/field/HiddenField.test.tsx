import { render, fireEvent, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { BlueForm } from "@/components"

describe("HiddenField – nested object", () => {
  it("registers value using full path instead of local name", async () => {
    let submitted: any = null

    render(
      <BlueForm
        config={{
          profile: {
            type: "group",
            props: {
              config: {
                userId: {
                  type: "hidden",
                  value: "u-123",
                },
              },
            },
          },
        }}
        onSubmit={(data) => {
          submitted = data
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>
    )

    fireEvent.click(screen.getByText("Submit"))

    expect(submitted).toEqual({
      profile: {
        userId: "u-123",
      },
    })

    // ensure it is NOT at root
    expect(submitted.userId).toBeUndefined()
  })
})
