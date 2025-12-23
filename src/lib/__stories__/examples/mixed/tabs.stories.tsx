/**
 * Demonstrates a multi-tab form using native UI.
 *
 * Tabs are implemented as UI-only schema nodes.
 * Each tab controls visibility of a subset of fields,
 * while the form state remains unified.
 */
import CheckboxField from "@/__stories__/components/with-native/CheckboxField"
import InputField from "@/__stories__/components/with-native/InputField"
import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import { useState } from "react"

interface Profile {
  basic: {
    name: string
    email: string
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

export const MultiTabForm: Story = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "preferences">("basic")

  return (
    <Form<Profile>
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>
          {/* Native tab header */}
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              disabled={activeTab === "basic"}
            >
              Basic
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preferences")}
              disabled={activeTab === "preferences"}
              style={{ marginLeft: 8 }}
            >
              Preferences
            </button>
          </div>

          {children}

          <button type="submit" style={{ marginTop: 16 }}>
            Submit
          </button>
        </form>
      )}
      onSubmit={(data) => {
        alert(JSON.stringify(data, null, 2))
      }}
      config={defineConfig<Profile>({
        /**
         * Tab: Basic information
         */
        basic: {
          type: "group",
          label: "Basic",
          visible: () => activeTab === "basic",
          props: {
            config: defineConfig<Profile["basic"]>({
              name: {
                type: "text",
                label: "Name",
              },
              email: {
                type: "text",
                label: "Email",
              },
            }),
          },
          render: ({ children, fieldProps: { label, visible } }) =>
            visible && (
              <fieldset>
                <legend>{label}</legend>
                {children}
              </fieldset>
            ),
        },

        /**
         * Tab: Preferences
         */
        preferences: {
          type: "group",
          label: "Preferences",
          visible: () => activeTab === "preferences",
          props: {
            config: defineConfig<Profile["preferences"]>({
              newsletter: {
                type: "checkbox",
                label: "Subscribe to newsletter",
              },
            }),
          },
          render: ({ children, fieldProps: { label, visible } }) =>
            visible && (
              <fieldset>
                <legend>{label}</legend>
                {children}
              </fieldset>
            ),
        },
      })}
    />
  )
}
