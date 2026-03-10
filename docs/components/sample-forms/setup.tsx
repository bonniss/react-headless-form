import { setupForm, defineMapping } from "react-headless-form";
import InputField from "../fields/InputField";

export const [Form] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
  }),
});
