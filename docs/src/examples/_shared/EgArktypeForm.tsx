import { type } from "arktype";
import EgSchemaLibForm from "./EgSchemaLibForm";

const SignupSchema = type({
  name: type("string.trim").to("string > 0").configure({ message: "Name is required" }),
  email: type("string.email").configure({ message: "Invalid email" }),
  // the message goes on the type that checks it (after the parse)
  age: type("string.integer.parse").to(type("number >= 18").configure({ message: "Must be 18 or older" })),
});

export default function EgArktypeForm() {
  return <EgSchemaLibForm schema={SignupSchema} />;
}
