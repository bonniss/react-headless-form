/**
 * Demonstrates UI-only fields in the form schema.
 *
 * UI fields are first-class schema nodes that:
 * - Do not participate in form state
 * - Do not require fieldMapping
 * - Are rendered purely via custom render functions
 *
 * This allows the schema to describe both:
 * - Form fields
 * - Layout and UI structure
 */
import { setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"

export default {
  title: "Core",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({})

export const PureUIFields: Story = () => {
  return (
    <Form
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      config={defineConfig({
        notice: {
          type: "ui",
          render: () => (
            <div style={{ padding: 12, background: "#f5f5f5" }}>
              This is a render-only UI block.
            </div>
          ),
        },
        name: {
          type: "ui",
          render: ({ fieldProps }) => (
            <div>
              <strong>Static field:</strong> {fieldProps.label}
            </div>
          ),
          label: "Name placeholder",
        },
      })}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}

PureUIFields.storyName = "Builtin types: UI-only field"
