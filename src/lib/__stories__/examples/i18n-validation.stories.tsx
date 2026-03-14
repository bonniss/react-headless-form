/**
 * Demonstrates full i18n support:
 * - Translated labels
 * - Translated descriptions
 * - Translated validation messages
 */

import { setupForm, defineMapping } from "@/components/form/setup";
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
    validationTranslation: {
      required: "field.required",
      minLength: "field.minLength",
    },
    t: (message, params) => {
      switch (message) {
        case "label.username":
          return "Username";
        case "desc.username":
          return "Your public username";

        case "field.required":
          return `${params?.field} is required`;

        case "field.minLength":
          return `${params?.field} must be at least ${params?.minLength} characters`;

        default:
          return message;
      }
    },
  },
});

export const I18nValidation: Story = () => {
  return (
    <Form
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={{
        username: {
          type: "text",
          label: "label.username",
          description: "desc.username",
          rules: {
            required: true,
            minLength: 4,
          },
        },
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  );
};

I18nValidation.storyName = "I18n: Validation";
