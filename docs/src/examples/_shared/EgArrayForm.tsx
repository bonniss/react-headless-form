import { Form, defineConfig } from "./form.setup";
import { useArrayField } from "react-headless-form";

type ExperienceItem = {
  company: string;
  role: string;
  years: string;
};

type ResumeData = {
  fullName: string;
  experience: ExperienceItem[];
};

const experienceConfig = defineConfig<ExperienceItem>({
  company: {
    type: "text",
    label: "Company",
    rules: { required: "Company is required" },
  },
  role: {
    type: "text",
    label: "Role",
    rules: { required: "Role is required" },
  },
  years: {
    type: "select",
    label: "Years of experience",
    rules: { required: "Please select" },
    props: {
      options: [
        { label: "Less than 1 year", value: "<1" },
        { label: "1–3 years", value: "1-3" },
        { label: "3–5 years", value: "3-5" },
        { label: "5+ years", value: "5+" },
      ],
    },
  },
});

function ArrayField() {
  const { label, items, renderItem, append, remove, duplicate, errorMessage } = useArrayField();

  return (
    <fieldset>
      <legend>{label}</legend>
      {items.map((field, index) => (
        <fieldset key={field.id}>
          <legend>#{index + 1}</legend>
          {renderItem(field, index)}
          <div>
            <button type="button" onClick={() => duplicate(index)}>
              Duplicate
            </button>{" "}
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={() => append({ company: "", role: "", years: "" })}>
        + Add experience
      </button>
      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </fieldset>
  );
}

function EgArrayForm() {
  return (
    <Form<ResumeData>
      config={{
        fullName: {
          type: "text",
          label: "Full Name",
          rules: { required: "Name is required" },
        },
        experience: {
          type: "array",
          label: "Work Experience",
          rules: {
            validate: (value) =>
              (value && value.length > 0) || "Add at least one experience",
          },
          render: () => <ArrayField />,
          props: {
            config: experienceConfig,
          },
        },
      }}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
    >
      <button type="submit">Submit resume</button>
    </Form>
  );
}

export default EgArrayForm;
