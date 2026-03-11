import Form from "./form.setup";

type LoginData = {
  username: string;
  password: string;
};

function LoginForm() {
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
        alert(JSON.stringify(data, null, 2));
      }}
    >
      <button type="submit">Log in</button>
    </Form>
  );
}

export default LoginForm;
