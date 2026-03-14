import { setupForm, defineMapping } from "@/components/form/setup";
import { Story, StoryDefault } from "@ladle/react";
import CheckboxField from "../components/CheckboxField";
import InputField from "../components/InputField";

export default {
  title: "Mixed",
} satisfies StoryDefault;

const [Form] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
    checkbox: CheckboxField,
  }),
});

export const ConditionalFields: Story = () => {
  return (
    <Form
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      config={{
        hasNickname: {
          type: "checkbox",
          label: "Has nickname?",
        },
        nickname: {
          type: "text",
          label: "Nickname",
          visible: (values) => Boolean(values.hasNickname),
        },
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  );
};
