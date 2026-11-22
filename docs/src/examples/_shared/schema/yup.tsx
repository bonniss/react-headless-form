import { useState } from "react";
import * as yup from "yup";
import { Form } from "../form.setup";

// Yup (1.7+) implements Standard Schema: it goes straight into `schema`.
// It casts while validating: the name is trimmed and the age becomes a number.
const signupSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().required("Email is required").email("Invalid email"),
  age: yup.number().typeError("Must be 18 or older").integer().min(18, "Must be 18 or older").required(),
});

export default function SignupForm() {
  const [output, setOutput] = useState<yup.InferType<typeof signupSchema>>();
  return (
    <Form
      schema={signupSchema}
      defaultValues={{ name: "", email: "", age: undefined }}
      config={{
        name: { type: "text", label: "Name" },
        email: { type: "text", label: "Email" },
        age: { type: "text", label: "Age", props: { inputMode: "numeric" } },
      }}
      // `data` is the schema output: the name trimmed, the age a number
      onSubmit={(data) => setOutput(data)}
    >
      <button type="submit">Sign up</button>
      {output && <pre data-testid="output">{JSON.stringify(output)}</pre>}
    </Form>
  );
}
