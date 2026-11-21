import { useState } from "react";
import { z } from "zod";
import { Form } from "./form.setup";

// Inputs are strings; the schema trims and coerces them.
const SignupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email"),
  age: z.coerce.number().int().min(18, "Must be 18 or older"),
  role: z.enum(["developer", "designer"]),
});

export default function EgSchemaForm() {
  const [submitted, setSubmitted] = useState<z.output<typeof SignupSchema>>();

  return (
    <>
      <Form
        schema={SignupSchema}
        defaultValues={{ name: "", email: "", age: "", role: "developer" }}
        config={{
          name: { type: "text", label: "Name" },
          email: { type: "text", label: "Email" },
          age: { type: "text", label: "Age", props: { inputMode: "numeric" } },
          role: {
            type: "select",
            label: "Role",
            props: {
              options: [
                { value: "developer", label: "Developer" },
                { value: "designer", label: "Designer" },
              ],
            },
          },
        }}
        // `data` is the schema output: age is a number, name is trimmed
        onSubmit={(data) => setSubmitted(data)}
      >
        <button type="submit">Sign up</button>
      </Form>
      {submitted && <pre data-testid="output">{JSON.stringify(submitted)}</pre>}
    </>
  );
}
