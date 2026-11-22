import { ajvResolver } from "@hookform/resolvers/ajv";
import type { JSONSchemaType } from "ajv";
import { useState } from "react";
import { Form } from "../form.setup";

type Signup = { name: string; email: string; age: number };

// A JSON Schema (for example served by a backend), validated with Ajv through
// `formOptions.resolver`. `errorMessage` (ajv-errors) sets the messages.
const signupSchema: JSONSchemaType<Signup> = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, errorMessage: { minLength: "Name is required" } },
    email: { type: "string", format: "email", errorMessage: { format: "Invalid email" } },
    age: { type: "integer", minimum: 18, errorMessage: "Must be 18 or older" },
  },
  required: ["name", "email", "age"],
  additionalProperties: false,
};

export default function SignupForm() {
  const [output, setOutput] = useState<object>();
  return (
    <Form
      // coerceTypes: the age input holds a string; Ajv converts it to a number
      formOptions={{ resolver: ajvResolver(signupSchema, { coerceTypes: true }) }}
      defaultValues={{ name: "", email: "", age: "" }}
      config={{
        name: { type: "text", label: "Name" },
        email: { type: "text", label: "Email" },
        age: { type: "text", label: "Age", props: { inputMode: "numeric" } },
      }}
      // `data` is what Ajv validated, with the age coerced to a number
      onSubmit={(data) => setOutput(data)}
    >
      <button type="submit">Sign up</button>
      {output && <pre data-testid="output">{JSON.stringify(output)}</pre>}
    </Form>
  );
}
