/**
 * Demonstrates an inline field.
 *
 * Inline fields are:
 * - Part of the form state
 * - Rendered inline via a one-off component
 *
 * This pattern is useful for highly custom,
 * one-off UI that still participates in the form.
 */

import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"

interface InlineForm {
  nickname: string
  acceptTerms: boolean
}

export default {
  title: "Core",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({}),
})

export const InlineField: Story = () => {
  return (
    <Form<InlineForm>
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={defineConfig({
        /**
         * Inline field rendered directly.
         */
        nickname: {
          type: "inline",
          label: "Nickname",
          rules: {
            required: "Nickname is required",
          },
          render: ({ fieldProps }) => {
            const { value, onChange, errorMessage, label, required } =
              fieldProps

            return (
              <div
                style={{
                  padding: 12,
                  border: "1px dashed #aaa",
                  marginBottom: 12,
                }}
              >
                <span>
                  {label} {required && "*"}
                </span>

                <input
                  value={value ?? ""}
                  onChange={(e) => onChange?.(e.target.value)}
                  placeholder="Enter your nickname"
                  style={{ display: "block", marginTop: 4 }}
                />

                {errorMessage && (
                  <div style={{ color: "red", marginTop: 4 }}>
                    {errorMessage}
                  </div>
                )}

                <small style={{ opacity: 0.7 }}>
                  Rendered inline via render callback
                </small>
              </div>
            )
          },
        },

        /**
         * Another inline field to show multiple one-off usages.
         */
        age: {
          type: "inline",
          label: "Age",
          render: ({ fieldProps }) => {
            const { value, onChange } = fieldProps

            return (
              <div style={{ marginBottom: 12 }}>
                <span>Age</span>
                <input
                  type="number"
                  value={value ?? ""}
                  onChange={(e) => onChange?.(Number(e.target.value))}
                  style={{ display: "block" }}
                />
              </div>
            )
          },
        },
      })}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}

InlineField.storyName = "Builtin types: Inline Field"
