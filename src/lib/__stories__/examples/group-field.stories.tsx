/**
 * Demonstrates nested form structures using the `section` builtin type.
 *
 * - `nested: true` creates a new namespace under the section key (object nesting).
 * - `config` defines the child fields to render within the section.
 * - `render` wraps the section UI without affecting namespace behavior.
 */
import { defineMapping, setupForm } from "@/components/form/setup";
import { Story, StoryDefault } from "@ladle/react";
import InputField from "../components/InputField";

interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
  };
}

export default {
  title: "Core",
} satisfies StoryDefault;

const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
  fieldMapping: defineMapping({
    text: InputField,
  }),
});

export const SectionNestedFields: Story = () => {
  return (
    <Form<UserProfile>
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={{
        personal: {
          type: "section",
          label: "Personal Information",
          props: {
            nested: true,
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
          render: ({ children, label }) => (
            <fieldset>
              <legend>{label}</legend>
              {children}
            </fieldset>
          ),
        },
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  );
};

SectionNestedFields.storyName = "Builtin types: Section (nested)";
