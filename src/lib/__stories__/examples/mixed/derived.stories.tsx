/**
 * Demonstrates derived (computed) fields.
 *
 * A derived field is not an input field.
 * Its value is computed from other form values
 * using react-hook-form primitives at render time.
 *
 * The form engine remains unaware of derived logic.
 */

import InputField from "@/__stories__/components/with-native/InputField"
import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import { useFormContext } from "react-hook-form"

interface UserForm {
  firstName: string
  lastName: string
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
 * A render-only derived field.
 * It reads form values directly from react-hook-form.
 */
const FullNamePreview = () => {
  const { watch } = useFormContext<UserForm>()

  const firstName = watch("firstName")
  const lastName = watch("lastName")

  const fullName = [firstName, lastName].filter(Boolean).join(" ")

  return (
    <div
      style={{
        padding: 8,
        background: "#f5f5f5",
        marginTop: 12,
      }}
    >
      <strong>Full name:</strong> {fullName || <em>(empty)</em>}
    </div>
  )
}

export const DerivedFields: Story = () => {
  return (
    <Form<UserForm>
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      onSubmit={(data) => {
        alert(JSON.stringify(data, null, 2))
      }}
      config={defineConfig({
        firstName: {
          type: "text",
          label: "First name",
        },
        lastName: {
          type: "text",
          label: "Last name",
        },

        /**
         * UI-only node for derived output.
         * This is not part of form submission.
         */
        fullNamePreview: {
          type: "ui",
          render: () => <FullNamePreview />,
        },
      })}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}
