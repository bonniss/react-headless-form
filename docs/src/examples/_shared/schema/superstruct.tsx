import { superstructResolver } from "@hookform/resolvers/superstruct";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { type Infer, coerce, define, object, refine, string, trimmed } from "superstruct";
import { Form } from "../form.setup";

// A refiner or validator that returns a string fails with that message
const age = define<number>("age", (value) =>
  (typeof value === "number" && Number.isInteger(value) && value >= 18) || "Must be 18 or older",
);

// `trimmed` and `coerce` run with `coerce: true`: the inputs hold strings,
// the name is trimmed and the age parsed
const signupSchema = object({
  name: refine(trimmed(string()), "name", (value) => value.length > 0 || "Name is required"),
  email: refine(string(), "email", (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Invalid email"),
  age: coerce(age, string(), (value) => (value === "" ? Number.NaN : Number(value))),
});
type Signup = Infer<typeof signupSchema>;
type Input = { name: string; email: string; age: string };

// The form holds the inputs (strings); the coerced output reaches onSubmit
const resolver = superstructResolver(signupSchema, { coerce: true }) as unknown as Resolver<Input>;

export default function SignupForm() {
  const [output, setOutput] = useState<Signup>();
  return (
    <Form
      formOptions={{ resolver }}
      defaultValues={{ name: "", email: "", age: "" }}
      config={{
        name: { type: "text", label: "Name" },
        email: { type: "text", label: "Email" },
        age: { type: "text", label: "Age", props: { inputMode: "numeric" } },
      }}
      // `data` is the coerced output: the name trimmed, the age a number
      onSubmit={(data) => setOutput(data as unknown as Signup)}
    >
      <button type="submit">Sign up</button>
      {output && <pre data-testid="output">{JSON.stringify(output)}</pre>}
    </Form>
  );
}
