/**
 * Demonstrates the hidden field type.
 *
 * Hidden fields:
 * - Are registered in the form state
 * - Are submitted with the form
 * - Do not render visible UI
 */

import InputField from "@/__stories__/components/with-native/InputField"
import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"

interface HiddenForm {
  name: string
  token: string
}

export default {
  title: "Core",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
  }),
})

export const HiddenField: Story = () => {
  return (
    <Form<HiddenForm>
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={defineConfig({
        name: {
          type: "text",
          label: "Name",
        },

        /**
         * Hidden field:
         * Included in submission but not shown.
         */
        token: {
          type: "hidden",
          defaultValue: "secure-token-123",
        },
      })}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}

HiddenField.storyName = "Builtin types: Hidden Field"
