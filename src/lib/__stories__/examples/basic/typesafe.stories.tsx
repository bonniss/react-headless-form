import { setupForm, defineFieldMapping } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import InputField from "../../components/with-native/InputField"

interface User {
  name: string
  email: string
}

export default {
  title: "Core",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
  }),
})

export const TypeSafeSchema: Story = () => {
  return (
    <Form<User>
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      config={defineConfig<User>({
        name: {
          type: "text",
          label: "Name",
        },
        email: {
          type: "text",
          label: "Email",
        },

        // ❌ Uncommenting the following line will cause a TypeScript error
        // age: { type: 'text' },
      })}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}
