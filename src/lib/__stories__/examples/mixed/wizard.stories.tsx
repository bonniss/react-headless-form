/**
 * Demonstrates a wizard-style multi-step form.
 *
 * Each step is implemented as a group whose visibility
 * is controlled by external UI state.
 *
 * The form engine remains unaware of steps or navigation.
 * All steps share a single form state.
 */

import CheckboxField from "@/__stories__/components/with-native/CheckboxField"
import InputField from "@/__stories__/components/with-native/InputField"
import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import { useState } from "react"

interface WizardForm {
  account: {
    email: string
    password: string
  }
  profile: {
    firstName: string
    lastName: string
  }
  preferences: {
    newsletter: boolean
  }
}

export default {
  title: "Mixed",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
    checkbox: CheckboxField,
  }),
})

export const WizardForm: Story = () => {
  const [step, setStep] = useState(0)

  const isFirstStep = step === 0
  const isLastStep = step === 2

  return (
    <Form<WizardForm>
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>
          {/* Step indicator */}
          <div style={{ marginBottom: 16 }}>
            <strong>Step {step + 1} / 3</strong>
          </div>

          {children}

          {/* Wizard navigation */}
          <div style={{ marginTop: 24 }}>
            <button
              type="button"
              disabled={isFirstStep}
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </button>

            {!isLastStep && (
              <button
                type="button"
                style={{ marginLeft: 8 }}
                onClick={() => setStep((s) => s + 1)}
              >
                Next
              </button>
            )}

            {isLastStep && (
              <button type="submit" style={{ marginLeft: 8 }}>
                Submit
              </button>
            )}
          </div>
        </form>
      )}
      onSubmit={(data) => {
        alert(JSON.stringify(data, null, 2))
      }}
      config={defineConfig<WizardForm>({
        /**
         * Step 1: Account
         */
        account: {
          type: "group",
          label: "Account",
          visible: () => step === 0,
          render: ({ children, fieldProps: { label, visible } }) =>
            visible && (
              <fieldset>
                <legend>{label}</legend>
                {children}
              </fieldset>
            ),
          props: {
            config: defineConfig<WizardForm["account"]>({
              email: {
                type: "text",
                label: "Email",
              },
              password: {
                type: "text",
                label: "Password",
                props: {
                  type: "password",
                },
              },
            }),
          },
        },

        /**
         * Step 2: Profile
         */
        profile: {
          type: "group",
          label: "Profile",
          visible: () => step === 1,
          render: ({ children, fieldProps: { label, visible } }) =>
            visible && (
              <fieldset>
                <legend>{label}</legend>
                {children}
              </fieldset>
            ),
          props: {
            config: defineConfig<WizardForm["profile"]>({
              firstName: {
                type: "text",
                label: "First name",
              },
              lastName: {
                type: "text",
                label: "Last name",
              },
            }),
          },
        },

        /**
         * Step 3: Preferences
         */
        preferences: {
          type: "group",
          label: "Preferences",
          visible: () => step === 2,
          render: ({ children, fieldProps: { label, visible } }) =>
            visible && (
              <fieldset>
                <legend>{label}</legend>
                {children}
              </fieldset>
            ),
          props: {
            config: defineConfig<WizardForm["preferences"]>({
              newsletter: {
                type: "checkbox",
                label: "Subscribe to newsletter",
              },
            }),
          },
        },
      })}
    />
  )
}
