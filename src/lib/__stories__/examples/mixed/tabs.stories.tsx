/**
 * Demonstrates a multi-tab form using native UI + component-owned `section`.
 *
 * Tabs are implemented as UI-driven visibility gates, while the form state
 * remains unified (single RHF instance).
 *
 * This story shows the "power move":
 * - `section.props.component` owns layout + schema for that section
 * - Section component uses `useField()` for label/visible/namespace
 * - `<Section />` renders a typesafe config fragment at the current namespace
 */
import CheckboxField from "@/__stories__/components/with-native/CheckboxField"
import InputField from "@/__stories__/components/with-native/InputField"
import { useField } from "@/components/form/provider"
import { defineMapping, setupForm } from "@/components/form/setup"
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

const [Form, defineConfig, Section] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
    checkbox: CheckboxField,
  }),
})

function BasicTabSection() {
  const { fieldProps } = useField()
  if (!fieldProps.visible) return null

  return (
    <fieldset>
      <legend>{fieldProps.label}</legend>

      <Section<Profile["basic"]>
        config={{
          name: {
            type: "text",
            label: "Name",
          },
          email: {
            type: "text",
            label: "Email",
          },
        }}
      />
    </fieldset>
  )
}

function PreferencesTabSection() {
  const { fieldProps } = useField()
  if (!fieldProps.visible) return null

  return (
    <fieldset>
      <legend>{fieldProps.label}</legend>

      <Section<Profile["preferences"]>
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
      config={{
        basic: {
          type: "section",
          label: "Basic",
          visible: () => activeTab === "basic",
          props: {
            nested: true,
            component: BasicTabSection,
          },
        },

        preferences: {
          type: "section",
          label: "Preferences",
          visible: () => activeTab === "preferences",
          props: {
            nested: true,
            component: PreferencesTabSection,
          },
        },
      }}
    />
  )
}

MultiTabForm.storyName = "Multi-tab (section component)"
