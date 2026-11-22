import * as v from "valibot";
import EgSchemaLibForm from "./EgSchemaLibForm";

const SignupSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required")),
  email: v.pipe(v.string(), v.email("Invalid email")),
  age: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(18, "Must be 18 or older")),
});

export default function EgValibotForm() {
  return <EgSchemaLibForm schema={SignupSchema} />;
}
