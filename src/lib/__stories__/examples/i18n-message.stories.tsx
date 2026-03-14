/**
 * Demonstrates translating labels and descriptions.
 */
import { defineMapping, setupForm } from "@/components/form/setup";
import { Story, StoryDefault } from "@ladle/react";
import InputField from "../components/InputField";

export default {
  title: "Core",
} satisfies StoryDefault;

const [Form] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
  fieldMapping: defineMapping({
    text: InputField,
  }),
  i18nConfig: {
    t: (message) => {
      switch (message) {
        case "label.username":
          return "Username";
        case "desc.username":
          return "Your public username";
        default:
          return message;
      }
    },
  },
});

export const I18nTranslateMessages: Story = () => {
  return (
    <Form
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={{
        username: {
          type: "text",
          label: "label.username",
          description: "desc.username",
        },
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  );
};

I18nTranslateMessages.storyName = "I18n: Messages";
