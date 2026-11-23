import { Schema } from "effect";
import { useState } from "react";
import { Form } from "../form.setup";

// Effect Schema implements Standard Schema through `toStandardSchemaV1`.
// The inputs hold strings; decoding trims the name and parses the age.
const signupSchema = Schema.toStandardSchemaV1(
  Schema.Struct({
    name: Schema.Trim.check(Schema.isNonEmpty({ message: "Name is required" })),
    email: Schema.String.check(Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email" })),
    age: Schema.FiniteFromString.annotate({ message: "Must be 18 or older" }).check(
      Schema.isInt({ message: "Must be 18 or older" }),
      Schema.isGreaterThanOrEqualTo(18, { message: "Must be 18 or older" }),
    ),
  }),
);

export default function SignupForm() {
  const [output, setOutput] = useState<(typeof signupSchema)["Type"]>();
  return (
    <Form
      schema={signupSchema}
      defaultValues={{ name: "", email: "", age: "" }}
      config={{
        name: { type: "text", label: "Name" },
        email: { type: "text", label: "Email" },
        age: { type: "text", label: "Age", props: { inputMode: "numeric" } },
      }}
      // `data` is the decoded output: the name trimmed, the age a number
      onSubmit={(data) => setOutput(data)}
    >
      <button type="submit">Sign up</button>
      {output && <pre data-testid="output">{JSON.stringify(output)}</pre>}
    </Form>
  );
}
