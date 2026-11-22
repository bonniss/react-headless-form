import { useState } from "react";
import type { StandardSchemaV1 } from "react-headless-form";
import { Form } from "./form.setup";

/** What the inputs hold (strings) and what onSubmit receives (age is a number). */
export type SignupInput = { name: string; email: string; age: string };
export type SignupOutput = { name: string; email: string; age: number };

/**
 * The same form for every schema library: only the schema changes. Any
 * Standard Schema (zod, valibot, arktype, …) goes straight into `schema`.
 */
export default function EgSchemaLibForm({
  schema,
}: {
  schema: StandardSchemaV1<SignupInput, SignupOutput>;
}) {
  const [output, setOutput] = useState<SignupOutput>();
  return (
    <>
      <Form
        schema={schema}
        defaultValues={{ name: "", email: "", age: "" }}
        config={{
          name: { type: "text", label: "Name" },
          email: { type: "text", label: "Email" },
          age: { type: "text", label: "Age" },
        }}
        onSubmit={(data) => setOutput(data)}
      >
        <button type="submit">Sign up</button>
      </Form>
      {output && <pre data-testid="output">{JSON.stringify(output)}</pre>}
    </>
  );
}
