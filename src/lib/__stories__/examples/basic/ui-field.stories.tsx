/**
 * Demonstrates UI-only nodes using the `section` builtin type.
 *
 * `section` can be used as a first-class schema node for layout / UI blocks:
 * - It does not have to provide `props.config`
 * - It can be rendered purely via `render()`
 * - It does not require a renderer in `fieldMapping`
 *
 * This allows the schema to describe both:
 * - Form fields
 * - Layout and UI structure
 */
import { defineMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"

export default {
  title: "Core",
} satisfies StoryDefault

const [Form] = setupForm({
  fieldMapping: defineMapping(),
})

export const PureUISections: Story = () => {
  return (
    <Form<{}>
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      config={{
        __notice: {
          type: "section",
          // UI-only block (no config, no component)
          render: () => (
            <div style={{ padding: 12, background: "#f5f5f5" }}>
              This is a render-only UI block.
            </div>
          ),
        },
        __name: {
          type: "section",
          label: "Name placeholder",
          // Still UI-only: label is resolved but this section does not
          // participate in form state unless it renders child fields.
          render: ({ fieldProps }) => (
            <div>
              <strong>Static label:</strong> {fieldProps.label}
            </div>
          ),
        },
      }}
    />
  )
}

PureUISections.storyName = "Builtin types: Section (pure UI)"
