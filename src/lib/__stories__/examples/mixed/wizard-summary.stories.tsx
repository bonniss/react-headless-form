/**
 * Demonstrates a wizard form with a read-only summary step.
 *
 * The summary step does not introduce new fields.
 * It only reads existing form values and renders them for review.
 *
 * This pattern is implemented entirely at the render layer,
 * without special support from the form engine.
 */

import { Story, StoryDefault } from "@ladle/react"
import { useState } from "react"
import { setupForm, defineFieldMapping } from "@/components/form/setup"
import { useFormContext } from "react-hook-form"
import InputField from "@/__stories__/components/with-native/InputField";

interface WizardForm {
  firstName: string
  lastName: string
  email: string
}

export default {
  title: "Mixed",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
  }),
})

/**
 * Read-only summary view.
 * This component reads form values directly from RHF.
 */
const SummaryStep = () => {
  const { getValues } = useFormContext<WizardForm>()
  const values = getValues()

  return (
    <div style={{ padding: 12, background: "#f5f5f5" }}>
      <h4>Review your information</h4>
      <ul>
        <li>
          <strong>First name:</strong> {values.firstName}
        </li>
        <li>
          <strong>Last name:</strong> {values.lastName}
        </li>
        <li>
          <strong>Email:</strong> {values.email}
        </li>
      </ul>
    </div>
  )
}

export const WizardSummaryStep: Story = () => {
  const [step, setStep] = useState(0)

  return (
    <Form<WizardForm>
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      onSubmit={(data) => {
        alert(JSON.stringify(data, null, 2))
      }}
      config={defineConfig({
        /**
         * Step 1
         */
        firstName: {
          type: "text",
          label: "First name",
          visible: () => step === 0,
        },
        lastName: {
          type: "text",
          label: "Last name",
          visible: () => step === 0,
        },

        /**
         * Step 2
         */
        email: {
          type: "text",
          label: "Email",
          visible: () => step === 1,
        },

        /**
         * Step 3 – summary
         */
        summary: {
          type: "ui",
          visible: () => step === 2,
          render: () => <SummaryStep />,
        },
      })}
    >
      <div style={{ marginTop: 16 }}>
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}

        {step < 2 && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            style={{ marginLeft: 8 }}
          >
            Next
          </button>
        )}

        {step === 2 && (
          <button type="submit" style={{ marginLeft: 8 }}>
            Submit
          </button>
        )}
      </div>
    </Form>
  )
}
