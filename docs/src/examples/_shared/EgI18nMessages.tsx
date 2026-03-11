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
    t: (message) => {
      switch (message) {
        case "label.username":
          return "Username";
        case "label.email":
          return "Email";
        case "desc.username":
          return "Your public display name";
        case "desc.email":
          return "We'll never share your email";
        default:
          return message;
      }
    },
  },
});

export default function EgI18nMessages() {
  return (
    <Form
      config={{
        username: {
          type: "text",
          label: "label.username",
          description: "desc.username",
        },
        email: {
          type: "text",
          label: "label.email",
          description: "desc.email",
          props: { type: "email" },
        },
      }}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
    >
      <button type="submit">Submit</button>
    </Form>
  );
}
