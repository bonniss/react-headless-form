// G5: `schema` prop — config / defaultValues / ref typed by the schema input,
// onSubmit typed by the schema output (RHF's TTransformedValues).
import {
  setupForm,
  defineMapping,
  useField,
  useFormRef,
  type InferSchemaInput,
  type InferSchemaOutput,
  type StandardSchemaV1,
} from "react-headless-form";
import type { ReactNode } from "react";
import { z } from "zod";
import * as v from "valibot";

type Eq<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const assert = <T extends true>() => {};

const TextInput = (_: { placeholder?: string }) => { useField(); return null; };
const Root = ({ children }: { children: ReactNode }) => <form>{children}</form>;
const [Form] = setupForm({ renderRoot: Root, fieldMapping: defineMapping({ text: TextInput }) });

// ---- zod: input/output differ (coerce, transform)
const UserSchema = z.object({
  name: z.string().min(1),
  age: z.string().transform((s) => Number(s)),
  tags: z.array(z.object({ label: z.string() })),
});
type In = InferSchemaInput<typeof UserSchema>;
type Out = InferSchemaOutput<typeof UserSchema>;
assert<Eq<In["age"], string>>();
assert<Eq<Out["age"], number>>();

function ZodForm() {
  const ref = useFormRef<In>();
  return (
    <>
      <Form
        ref={ref}
        schema={UserSchema}
        config={{ name: { type: "text" }, age: { type: "text", props: { placeholder: "18" } } }}
        defaultValues={{ age: "18" }}
        onSubmit={(data, form) => {
          assert<Eq<typeof data, Out>>();
          data.age.toFixed();
          form.getValues("age").toUpperCase(); // form values are the input type
        }}
        onSubmitSuccess={(data) => { data.age.toFixed(); }}
        onSubmitFailure={(_err, values) => { assert<Eq<typeof values, In>>(); }}
        onFormChange={(values) => { assert<Eq<typeof values, In>>(); }}
      />
      <Form
        schema={UserSchema}
        config={{}}
        // @ts-expect-error onSubmit sees the output type: age is a number
        onSubmit={(data) => data.age.toUpperCase()}
      />
      {/* @ts-expect-error config keys are checked against the schema input */}
      <Form schema={UserSchema} config={{ nmae: { type: "text" } }} />
      {/* @ts-expect-error defaultValues follow the schema input (age is a string) */}
      <Form schema={UserSchema} config={{}} defaultValues={{ age: 18 }} />
      {/* @ts-expect-error a schema form cannot also set a resolver */}
      <Form schema={UserSchema} config={{}} formOptions={{ resolver: async () => ({ values: {}, errors: {} }) }} />
      <Form schema={UserSchema} config={{}} formOptions={{ mode: "onBlur" }} />
    </>
  );
}

// ---- valibot
const LoginSchema = v.object({ email: v.pipe(v.string(), v.email()), remember: v.optional(v.boolean(), false) });
function ValibotForm() {
  return (
    <Form
      schema={LoginSchema}
      config={{ email: { type: "text" } }}
      onSubmit={(data) => { assert<Eq<typeof data.remember, boolean>>(); }}
    />
  );
}

// ---- a hand-written Standard Schema
type Point = { x: number };
const PointSchema: StandardSchemaV1<Point, { x: string }> = {
  "~standard": { version: 1, vendor: "test", validate: (value) => ({ value: { x: String((value as Point).x) } }) },
};
function CustomForm() {
  return <Form schema={PointSchema} config={{ x: { type: "text" } }} onSubmit={(d) => { assert<Eq<typeof d, { x: string }>>(); }} />;
}

// ---- without schema, explicit and inferred models still work
type User = { name: string };
function PlainForms() {
  return (
    <>
      <Form<User> config={{ name: { type: "text" } }} onSubmit={(d) => { assert<Eq<typeof d, User>>(); }} />
      {/* @ts-expect-error an explicit model form cannot take a schema */}
      <Form<User> schema={UserSchema} config={{}} />
    </>
  );
}

export { ZodForm, ValibotForm, CustomForm, PlainForms };
