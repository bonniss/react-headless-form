import { setupForm, defineFieldMapping } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import CheckboxField from "../../components/with-native/CheckboxField"
import InputField from "../../components/with-native/InputField"

export default {
  title: "Mixed",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
    checkbox: CheckboxField,
  }),
})

export const ConditionalFields: Story = () => {
  return (
    <Form
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      config={defineConfig({
        hasNickname: {
          type: "checkbox",
          label: "Has nickname?",
        },
        nickname: {
          type: "text",
          label: "Nickname",
          visible: (values) => Boolean(values.hasNickname),
        },
      })}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}
