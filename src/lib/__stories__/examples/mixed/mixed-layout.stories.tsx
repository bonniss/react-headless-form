/**
 * Demonstrates a mixed layout (dashboard-style) form.
 *
 * The form layout is completely custom:
 * - Fields
 * - UI blocks
 * - Live preview
 * - Action panel
 *
 * The form engine only manages data and validation.
 * Layout is entirely controlled by the consumer.
 */

import InputField from "@/__stories__/components/with-native/InputField"
import TextAreaField from "@/__stories__/components/with-native/TextAreaField"
import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import { useFormContext } from "react-hook-form"

interface ProfileForm {
  title: string
  description: string
}

export default {
  title: "Mixed",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
    longText: TextAreaField,
  }),
})

/**
 * Live preview panel.
 * Reads form values directly from react-hook-form.
 */
const PreviewPanel = () => {
  const { watch } = useFormContext<ProfileForm>()
  const values = watch()

  return (
    <div
      style={{
        padding: 12,
        borderLeft: "1px solid #ddd",
        background: "#fafafa",
      }}
    >
      <h4>Live preview</h4>

      <p>
        <strong>Title:</strong> {values.title || <em>(empty)</em>}
      </p>

      <p>
        <strong>Description:</strong> {values.description || <em>(empty)</em>}
      </p>
    </div>
  )
}

/**
 * Custom action panel.
 * Can live anywhere in the layout.
 */
const ActionPanel = () => {
  const { formState } = useFormContext()

  return (
    <div
      style={{
        padding: 12,
        borderTop: "1px solid #eee",
        marginTop: 16,
      }}
    >
      <button type="submit">Save</button>

      {!formState.isValid && (
        <span style={{ marginLeft: 8, color: "red" }}>
          Form has validation errors
        </span>
      )}
    </div>
  )
}

export const MixedLayoutForm: Story = () => {
  return (
    <Form<ProfileForm>
      renderRoot={({ children, onSubmit }) => (
        <form
          onSubmit={onSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 16,
          }}
        >
          {children}
        </form>
      )}
      onSubmit={(data) => {
        alert(JSON.stringify(data, null, 2))
      }}
      config={defineConfig({
        /**
         * Main form fields
         */
        title: {
          type: "text",
          label: "Title",
          rules: {
            required: "Title is required",
          },
        },

        description: {
          type: "longText",
          label: "Description",
        },

        /**
         * UI-only layout blocks
         */
        preview: {
          type: "ui",
          render: () => <PreviewPanel />,
        },

        actions: {
          type: "ui",
          render: () => <ActionPanel />,
        },
      })}
    />
  )
}
