import { type } from "arktype";
import { useState } from "react";
import { Form } from "../form.setup";

// The inputs hold strings; the schema trims the name and parses the age
const signupSchema = type({
  name: type("string.trim").to(type("string > 0").configure({ message: "Name is required" })),
  email: type("string.email").configure({ message: "Invalid email" }),
  // the message goes on the type that checks it (after the parse)
  age: type("string.integer.parse").to(type("number >= 18").configure({ message: "Must be 18 or older" })),
});

export default function SignupForm() {
  const [output, setOutput] = useState<typeof signupSchema.infer>();
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
