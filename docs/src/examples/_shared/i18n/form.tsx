import { defineMapping, setupForm } from "react-headless-form";
import InputField from "../fields/InputField";

// The fixed part of i18n, once for every form: which keys the validation
// messages use and which props are translated. Each <Form> passes only `t`;
// the two are merged key by key.
export const [I18nForm] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <div className="blueform-example">
      <form onSubmit={onSubmit}>{children}</form>
    </div>
  ),
  fieldMapping: defineMapping({ text: InputField }),
  i18nConfig: {
    validationTranslation: { required: "validation_required", minLength: "validation_min_length" },
    translateProps: ["placeholder"],
  },
});
