/**
 * Demonstrates translating labels and descriptions.
 */
import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import InputField from "../../components/with-native/InputField"

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
  i18nConfig: {
    t: (message) => {
      switch (message) {
        case "label.username":
          return "Username"
        case "desc.username":
          return "Your public username"
        default:
          return message
      }
    },
  },
})

export const I18nTranslateMessages: Story = () => {
  return (
    <Form
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={defineConfig({
        username: {
          type: "text",
          label: "label.username",
          description: "desc.username",
        },
      })}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}

I18nTranslateMessages.storyName = "I18n: Messages"
