import { setupForm, defineMapping } from "react-headless-form";
import InputField from "./fields/InputField";
import CheckboxField from "./fields/CheckboxField";
import TextAreaField from "./fields/TextAreaField";
import SelectField from "./fields/SelectField";
import "./example.css";

export const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <div className="blueform-example">
      <form onSubmit={onSubmit}>{children}</form>
    </div>
  ),
  fieldMapping: defineMapping({
    text: InputField,
    longText: TextAreaField,
    checkbox: CheckboxField,
    select: SelectField,
  }),
});
