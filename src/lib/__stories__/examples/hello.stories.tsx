import { setupForm, defineMapping } from "@/components/form/setup";
import { Story, StoryDefault } from "@ladle/react";
import InputField from "../components/InputField";

export default {
  title: "Core",
} satisfies StoryDefault;

const [Form] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
  }),
});

export const HelloWorld: Story = () => {
  return (
    <Form
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={{
        name: {
          type: "text",
          label: "Your name",
        },
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  );
};
