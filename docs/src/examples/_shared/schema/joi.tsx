import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useState } from "react";
import { Form } from "../form.setup";

type Signup = { name: string; email: string; age: number };

// Joi converts while validating (trim, string to number) and, through
// `formOptions.resolver`, `onSubmit` receives the converted values.
const signupSchema = Joi.object<Signup>({
  name: Joi.string().trim().required().messages({ "string.empty": "Name is required" }),
  email: Joi.string()
    .email({ tlds: false }) // no TLD list in the browser
    .required()
    .messages({ "string.empty": "Invalid email", "string.email": "Invalid email" }),
  age: Joi.number()
    .integer()
    .min(18)
    .required()
    .messages({ "number.base": "Must be 18 or older", "number.integer": "Must be 18 or older", "number.min": "Must be 18 or older" }),
});

export default function SignupForm() {
  const [output, setOutput] = useState<Signup>();
  return (
    <Form
      formOptions={{ resolver: joiResolver(signupSchema) }}
      defaultValues={{ name: "", email: "", age: "" }}
      config={{
        name: { type: "text", label: "Name" },
        email: { type: "text", label: "Email" },
        age: { type: "text", label: "Age", props: { inputMode: "numeric" } },
      }}
      // `data` is what Joi converted: the name trimmed, the age a number
      onSubmit={(data) => setOutput(data as unknown as Signup)}
    >
      <button type="submit">Sign up</button>
      {output && <pre data-testid="output">{JSON.stringify(output)}</pre>}
    </Form>
  );
}
