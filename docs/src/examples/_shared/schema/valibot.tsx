import { useState } from "react";
import * as v from "valibot";
import { Form } from "../form.setup";

// The inputs hold strings; the schema trims the name and parses the age
const signupSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required")),
  email: v.pipe(v.string(), v.email("Invalid email")),
  age: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(18, "Must be 18 or older")),
});

export default function SignupForm() {
  const [output, setOutput] = useState<v.InferOutput<typeof signupSchema>>();
  return (
    <Form
      schema={signupSchema}
      defaultValues={{ name: "", email: "", age: "" }}
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
