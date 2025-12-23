/**
 * Demonstrates dynamic array fields.
 * Array fields allow runtime addition and removal of field groups.
 */
import { setupForm, defineFieldMapping } from "@/components/form/setup"
import { useArrayField } from "@/components"
import { Story, StoryDefault } from "@ladle/react"
import InputField from "../../components/with-native/InputField"

interface User {
  addresses: {
    street: string
    city: string
  }[]
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

export const ArrayFields: Story = () => {
  return (
    <Form<User>
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={defineConfig<User>({
        addresses: {
          type: "array",
          label: "Addresses",
          render: ({ fieldProps, children }) => {
            const {
              controller: { append },
            } = useArrayField()

            return (
              <fieldset>
                <legend>{fieldProps.label}</legend>
                {children}
                <button type="button" onClick={() => append({})}>
                  Add address
                </button>
              </fieldset>
            )
          },
          props: {
            config: defineConfig<User["addresses"][number]>({
              street: {
                type: "text",
                label: "Street",
              },
              city: {
                type: "text",
                label: "City",
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

ArrayFields.storyName = "Builtin types: Array field"