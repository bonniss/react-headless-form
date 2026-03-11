import { setupForm, defineMapping } from "react-headless-form";
import InputField from "./fields/InputField";

const [Form] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <div className="blueform-example">
      <form onSubmit={onSubmit}>{children}</form>
    </div>
  ),
  fieldMapping: defineMapping({ text: InputField }),
  i18nConfig: {
    validationTranslation: {
      required: "validation.required",
      minLength: "validation.minLength",
      pattern: "validation.pattern",
    },
    t: (message, params) => {
      switch (message) {
        case "label.username":
          return "Username";
        case "label.email":
          return "Email";
        case "label.password":
          return "Password";
        case "desc.username":
          return "Your public display name";

        case "validation.required":
          return `${params?.field} is required`;
        case "validation.minLength":
          return `${params?.field} must be at least ${params?.minLength} characters`;
        case "validation.pattern":
          return `${params?.field} format is invalid`;

        default:
          return message;
      }
    },
  },
});

export default function EgI18nValidation() {
  return (
    <Form
      config={{
        username: {
          type: "text",
          label: "label.username",
          description: "desc.username",
          rules: {
            required: true,
            minLength: 3,
          },
        },
        email: {
          type: "text",
          label: "label.email",
          props: { type: "email" },
          rules: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          },
        },
        password: {
          type: "text",
          label: "label.password",
          props: { type: "password" },
          rules: {
            required: true,
            minLength: 6,
          },
        },
      }}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
    >
      <button type="submit">Submit</button>
    </Form>
  );
}
