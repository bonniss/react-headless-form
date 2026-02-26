/**
 * Demonstrates a wizard-style multi-step form using component-owned `section`.
 *
 * Each step is a `section` whose visibility is controlled by external UI state.
 * The form engine remains unaware of steps/navigation. All steps share one RHF state.
 *
 * This story showcases:
 * - `section.props.component` owns layout + schema for the step
 * - step component uses `useField()` to access label/visible
 * - `<Section />` renders a typesafe config fragment at the current namespace
 */

import CheckboxField from "@/__stories__/components/with-native/CheckboxField"
import InputField from "@/__stories__/components/with-native/InputField"
import { useField } from "@/components/form/provider"
import { defineMapping, setupForm } from "@/components/form/setup"
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

const [Form, defineConfig, Section] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
    checkbox: CheckboxField,
  }),
})

function AccountStep() {
  const { fieldProps } = useField()
  if (!fieldProps.visible) return null

  return (
    <fieldset>
      <legend>{fieldProps.label}</legend>

      <Section<WizardForm["account"]>
        config={{
          email: {
            type: "text",
            label: "Email",
          },
          password: {
            type: "text",
            label: "Password",
            props: { type: "password" },
          },
        }}
      />
    </fieldset>
  )
}

function ProfileStep() {
  const { fieldProps } = useField()
  if (!fieldProps.visible) return null

  return (
    <fieldset>
      <legend>{fieldProps.label}</legend>

      <Section<WizardForm["profile"]>
        config={{
          firstName: {
            type: "text",
            label: "First name",
          },
          lastName: {
            type: "text",
            label: "Last name",
          },
        }}
      />
    </fieldset>
  )
}

function PreferencesStep() {
  const { fieldProps } = useField()
  if (!fieldProps.visible) return null

  return (
    <fieldset>
      <legend>{fieldProps.label}</legend>

      <Section<WizardForm["preferences"]>
        config={{
          newsletter: {
            type: "checkbox",
            label: "Subscribe to newsletter",
          },
        }}
      />
    </fieldset>
  )
}

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
      config={{
        account: {
          type: "section",
          label: "Account",
          visible: () => step === 0,
          props: {
            nested: true,
            component: AccountStep,
          },
        },

        profile: {
          type: "section",
          label: "Profile",
          visible: () => step === 1,
          props: {
            nested: true,
            component: ProfileStep,
          },
        },

        preferences: {
          type: "section",
          label: "Preferences",
          visible: () => step === 2,
          props: {
            nested: true,
            component: PreferencesStep,
          },
        },
      }}
    />
  )
}

WizardForm.storyName = "Wizard (section component)"
