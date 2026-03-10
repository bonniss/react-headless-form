import { setupForm, defineMapping } from "react-headless-form";
import InputField from "../fields/InputField";

type LoginData = {
  username: string;
  password: string;
};

const [Form] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
  }),
});

export const BasicForm = () => {
  return (
    <Form<LoginData>
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit}>{children}</form>
      )}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={{
        username: {
          type: "text",
          label: "Your name",
          rules: {
            required: "Name is required",
          },
        },
        password: {
          type: "text",
          label: "Password",
          rules: {
            required: "Password is required",
          },
          props: {
            type: "password",
          },
        },
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  );
};
