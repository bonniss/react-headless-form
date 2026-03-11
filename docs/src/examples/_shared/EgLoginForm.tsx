import { Form } from "./form.setup";

type LoginData = {
  username: string;
  password: string;
};

export function LoginForm() {
  return (
    <Form<LoginData>
      config={{
        username: {
          type: "text",
          label: "Username",
          rules: {
            required: "Username is required",
          },
        },
        password: {
          type: "text",
          label: "Password",
          props: { type: "password" },
          rules: {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          },
        },
      }}
      onSubmit={(data) => {
        console.log(data);
      }}
    >
      <button type="submit">Log in</button>
    </Form>
  );
}
