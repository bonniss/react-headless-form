/**
 * Demonstrates grouped and nested form structures.
 * Groups introduce a namespace and allow custom layout rendering.
 */
import { defineMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import InputField from "../../components/with-native/InputField"

interface UserProfile {
  personal: {
    firstName: string
    lastName: string
  }
}

export default {
  title: "Core",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
  fieldMapping: defineMapping({
    text: InputField,
  }),
})

export const GroupAndNestedFields: Story = () => {
  return (
    <Form<UserProfile>
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={{
        personal: {
          type: "section",
          label: "Personal Information",
          render: ({ children, fieldProps: { label } }) => (
            <fieldset>
              <legend>{label}</legend>
              {children}
            </fieldset>
          ),
          props: {
            nested: true,
            config: defineConfig<UserProfile["personal"]>({
              firstName: {
                type: "text",
                label: "First name",
                defaultValue: "John",
              },
              lastName: {
                type: "text",
                label: "Last name",
                defaultValue: "Doe",
              },
            }),
          },
        },
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}

GroupAndNestedFields.storyName = "Builtin types: Nested field"
