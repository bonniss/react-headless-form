import { useState } from "react";
import { defineDynamicConfig, defineMapping, setupForm } from "react-headless-form";
import ArrayField from "./fields/ArrayField";
import CheckboxField from "./fields/CheckboxField";
import InputField from "./fields/InputField";
import SelectField from "./fields/SelectField";

// JSON configs cannot carry `render` functions, so `array` gets a component.
const [Form] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <div className="blueform-example">
      <form onSubmit={onSubmit}>{children}</form>
    </div>
  ),
  fieldMapping: defineMapping({
    text: InputField,
    select: SelectField,
    checkbox: CheckboxField,
    array: ArrayField,
  }),
});

// A config as it could be stored in a database: plain JSON, no functions.
const STORED_CONFIG = `{
  "plan": {
    "type": "select",
    "label": "Plan",
    "props": { "options": [
      { "value": "free", "label": "Free" },
      { "value": "team", "label": "Team" },
      { "value": "business", "label": "Business" }
    ] }
  },
  "seats": {
    "type": "text",
    "label": "Seats",
    "visible": { "when": "plan", "in": ["team", "business"] }
  },
  "invoiceEmail": {
    "type": "text",
    "label": "Invoice email",
    "visible": { "when": "plan", "eq": "business" },
    "required": { "when": "seats", "gte": 10 }
  },
  "members": {
    "type": "array",
    "label": "Members",
    "visible": { "when": "plan", "neq": "free" },
    "props": { "config": {
      "role": {
        "type": "select",
        "label": "Role",
        "props": { "options": [
          { "value": "member", "label": "Member" },
          { "value": "other", "label": "Other" }
        ] }
      },
      "roleDetail": {
        "type": "text",
        "label": "Describe the role",
        "visible": { "when": "role", "eq": "other" }
      },
      "billingContact": {
        "type": "checkbox",
        "label": "Billing contact",
        "visible": { "when": "plan", "from": "root", "eq": "business" }
      }
    } }
  }
}`;

const config = defineDynamicConfig(JSON.parse(STORED_CONFIG));

export default function EgJsonConditionsForm() {
  const [submitted, setSubmitted] = useState<unknown>();
  return (
    <>
      <Form
        config={config}
        defaultValues={{ plan: "free", seats: "", members: [{ role: "member" }] }}
        onSubmit={(data) => setSubmitted(data)}
      >
        <button type="submit">Save</button>
      </Form>
      {submitted !== undefined && <pre data-testid="output">{JSON.stringify(submitted, null, 2)}</pre>}
    </>
  );
}
