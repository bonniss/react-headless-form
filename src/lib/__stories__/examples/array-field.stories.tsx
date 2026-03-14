/**
 * Demonstrates dynamic array fields.
 * Array fields allow runtime addition and removal of field groups.
 */
/** biome-ignore-all lint/correctness/useHookAtTopLevel: <explanation> */
import { useArrayField } from "@/components";
import { defineMapping, setupForm } from "@/components/form/setup";
import { Story, StoryDefault } from "@ladle/react";
import InputField from "../components/InputField";

interface User {
  fullName: string;
  social: {
    youtube: string;
  };
  addresses: {
    street: string;
    city: string;
  }[];
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

export const ArrayFields: Story = () => {
  return (
    <Form<User>
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={{
        fullName: {
          type: "text",
          label: "Full name",
          rules: {
            required: "Full name is required",
          },
        },
        "social.youtube": {
          type: "text",
          label: "YouTube",
          props: {
            style: {
              backgroundColor: "red",
            },
          },
        },
        addresses: {
          type: "array",
          label: "Addresses",
          rules: {
            required: "Addresses are required",
            minLength: {
              value: 2,
              message: "At least 2 addresses are required",
            },
          },
          props: {
            config: defineConfig<User["addresses"][number]>({
              street: {
                type: "text",
                label: "Street",
                rules: {
                  required: true,
                },
              },
              city: {
                type: "text",
                label: "City",
              },
            }),
          },
          render: ({ label, errorMessage, append, children }) => {
            return (
              <fieldset>
                <legend>{label}</legend>
                {children}
                <button type="button" onClick={() => append({})}>
                  Add address
                </button>
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
              </fieldset>
            );
          },
        },
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  );
};

ArrayFields.storyName = "Builtin types: Array field";
