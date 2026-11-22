import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import * as yup from "yup";
import { Form } from "../form.setup";

// Yup is not a Standard Schema: it goes through `formOptions.resolver`.
// It casts while validating: the name is trimmed and the age becomes a number.
const signupSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().required("Email is required").email("Invalid email"),
  age: yup.number().typeError("Must be 18 or older").integer().min(18, "Must be 18 or older").required(),
});

type Signup = yup.InferType<typeof signupSchema>;

export default function SignupForm() {
  const [output, setOutput] = useState<Signup>();
  return (
    <Form<Signup>
      formOptions={{ resolver: yupResolver(signupSchema) }}
      config={{
        name: { type: "text", label: "Name" },
        email: { type: "text", label: "Email" },
        age: { type: "text", label: "Age", props: { inputMode: "numeric" } },
      }}
      // `data` holds the cast values (age is a number)
      onSubmit={(data) => setOutput(data)}
    >
      <button type="submit">Sign up</button>
      {output && <pre data-testid="output">{JSON.stringify(output)}</pre>}
    </Form>
  );
}
