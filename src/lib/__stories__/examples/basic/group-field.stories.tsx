/**
 * Demonstrates grouped and nested form structures.
 * Groups introduce a namespace and allow custom layout rendering.
 */
import { setupForm, defineFieldMapping } from "@/components/form/setup"
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
  fieldMapping: defineFieldMapping({
    text: InputField,
  }),
})

export const GroupAndNestedFields: Story = () => {
  return (
    <Form<UserProfile>
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={defineConfig<UserProfile>({
        personal: {
          type: "group",
          label: "Personal Information",
          render: ({ children, fieldProps: { label } }) => (
            <fieldset>
              <legend>{label}</legend>
              {children}
            </fieldset>
          ),
          props: {
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
      })}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}

GroupAndNestedFields.storyName = "Builtin types: Nested field"
