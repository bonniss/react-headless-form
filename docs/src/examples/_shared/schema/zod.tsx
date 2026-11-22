import { useState } from "react";
import { z } from "zod";
import { Form } from "../form.setup";

// The inputs hold strings; the schema trims the name and parses the age
const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email"),
  age: z.coerce.number<string>().int().min(18, "Must be 18 or older"),
});

export default function SignupForm() {
  const [output, setOutput] = useState<z.output<typeof signupSchema>>();
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
