import { setupForm, defineFieldMapping } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import InputField from "../../components/with-native/InputField"

export default {
  title: "Core",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
  }),
})

export const HelloWorld: Story = () => {
  return (
    <Form
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={defineConfig({
        name: {
          type: "text",
          label: "Your name",
        },
      })}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}
