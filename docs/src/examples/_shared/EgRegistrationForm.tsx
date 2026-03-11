import Form from "./form.setup";

type RegistrationData = {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  role: string;
  bio: string;
  agree: boolean;
};

function EgRegistrationForm() {
  return (
    <Form<RegistrationData>
      config={{
        username: {
          type: "text",
          label: "Username",
          rules: {
            required: "Username is required",
            minLength: { value: 3, message: "At least 3 characters" },
          },
        },
        email: {
          type: "text",
          label: "Email",
          props: { type: "email" },
          rules: {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          },
        },
        role: {
          type: "select",
          label: "Role",
          rules: { required: "Please select a role" },
          props: {
            options: [
              { label: "Developer", value: "developer" },
              { label: "Designer", value: "designer" },
              { label: "Product Manager", value: "pm" },
            ],
          },
        },
        password: {
          type: "text",
          label: "Password",
          props: { type: "password" },
          rules: {
            required: "Password is required",
            minLength: { value: 6, message: "At least 6 characters" },
          },
        },
        password_confirm: {
          type: "text",
          label: "Confirm Password",
          props: { type: "password" },
          disabled: (values) => !values.password,
          rules: {
            required: "Please confirm your password",
            validate: (value, formValues) =>
              value === formValues.password || "Passwords do not match",
          },
        },
        bio: {
          type: "longText",
          label: "Bio",
          description: "Tell us a bit about yourself (optional)",
        },
        agree: {
          type: "checkbox",
          label: "I agree to the terms and conditions",
          rules: { required: "You must agree to continue" },
        },
      }}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
    >
      <button type="submit">Create account</button>
    </Form>
  );
}

export default EgRegistrationForm;
