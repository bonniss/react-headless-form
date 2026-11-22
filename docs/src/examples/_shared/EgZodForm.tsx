import { z } from "zod";
import EgSchemaLibForm from "./EgSchemaLibForm";

const SignupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email"),
  age: z.coerce.number<string>().int().min(18, "Must be 18 or older"),
});

export default function EgZodForm() {
  return <EgSchemaLibForm schema={SignupSchema} />;
}
