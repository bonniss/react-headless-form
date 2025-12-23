/**
 * Demonstrates a wizard-style multi-step form
 * with step-level validation guards.
 *
 * Navigation to the next step is blocked
 * unless all fields in the current step are valid.
 *
 * The form engine remains unaware of steps or validation flow.
 */

import { setupForm, defineFieldMapping } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import { useRef, useState } from "react"
import type { BlueFormRef } from "@/types/form"
import InputField from "@/__stories__/components/with-native/InputField"
import CheckboxField from "@/__stories__/components/with-native/CheckboxField"

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
  i18nConfig: {
    validationTranslation: {
      required: "field.required",
      minLength: "field.minLength",
    },
    t: (message, params) => {
      switch (message) {
        case "field.required":
          return `${params?.field} is required`
        case "field.minLength":
          return `${params?.field} must be at least ${params?.minLength} characters`
        default:
          return message
      }
    },
  },
})

export const WizardWithValidationGuard: Story = () => {
  const formRef = useRef<BlueFormRef<WizardForm> | null>(null)
  const [step, setStep] = useState(0)

  const isFirstStep = step === 0
  const isLastStep = step === 2

  /**
   * Validates only the fields belonging to the current step.
   * If validation passes, navigation is allowed.
   */
  const goNext = async () => {
    if (!formRef.current) return

    let fieldsToValidate: string[] = []

    if (step === 0) {
      fieldsToValidate = ["account.email", "account.password"]
    }

    if (step === 1) {
      fieldsToValidate = ["profile.firstName", "profile.lastName"]
    }

    const isValid = await formRef.current.trigger(fieldsToValidate)

    if (isValid) {
      setStep((s) => s + 1)
    }
  }

  return (
    <Form<WizardForm>
      ref={formRef}
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
              <button type="button" style={{ marginLeft: 8 }} onClick={goNext}>
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
      formProps={{
        mode: "onChange",
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
                rules: {
                  required: true,
                },
              },
              password: {
                type: "text",
                label: "Password",
                rules: {
                  required: true,
                  minLength: 6,
                },
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
                rules: {
                  required: true,
                },
              },
              lastName: {
                type: "text",
                label: "Last name",
                rules: {
                  required: true,
                },
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
