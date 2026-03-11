import { DevTool } from "@hookform/devtools";
import { defineMapping, setupForm } from "react-headless-form";
import CheckboxField from "./fields/CheckboxField";
import InputField from "./fields/InputField";
import SelectField from "./fields/SelectField";
import TextAreaField from "./fields/TextAreaField";

const [Form] = setupForm({
  renderRoot: ({ children, onSubmit, formMethods: { control } }) => (
    <div style={{ position: "relative" }}>
      <div className="blueform-example">
        <form onSubmit={onSubmit}>{children}</form>
      </div>
      <DevTool control={control} placement="top-right" />
    </div>
  ),
  fieldMapping: defineMapping({
    text: InputField,
    longText: TextAreaField,
    select: SelectField,
    checkbox: CheckboxField,
  }),
});

type ProfileData = {
  name: string;
  email: string;
  role: string;
  bio: string;
  newsletter: boolean;
};

export default function EgDevTools() {
  return (
    <Form<ProfileData>
      config={{
        name: {
          type: "text",
          label: "Full Name",
          rules: { required: "Name is required" },
        },
        email: {
          type: "text",
          label: "Email",
          props: { type: "email" },
          rules: { required: "Email is required" },
        },
        role: {
          type: "select",
          label: "Role",
          defaultValue: "developer",
          props: {
            options: [
              { label: "Developer", value: "developer" },
              { label: "Designer", value: "designer" },
              { label: "Product Manager", value: "pm" },
            ],
          },
        },
        bio: {
          type: "longText",
          label: "Bio",
          description: "Tell us about yourself",
        },
        newsletter: {
          type: "checkbox",
          label: "Subscribe to newsletter",
        },
      }}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
    >
      <button type="submit">Save</button>
    </Form>
  );
}
