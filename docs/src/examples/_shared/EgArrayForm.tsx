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
  const { items, renderItem, append, remove, duplicate, errorMessage } =
    useArrayField();

  return (
    <div>
      {items.map((field, index) => (
        <div
          key={field.id}
          style={{
            border: "1px solid var(--bf-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "var(--bf-text-muted)",
              }}
            >
              #{index + 1}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => duplicate(index)}>
                Duplicate
              </button>
              <button type="button" onClick={() => remove(index)}>
                Remove
              </button>
            </div>
          </div>
          {renderItem(field, index)}
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ company: "", role: "", years: "" })}
        style={{ marginTop: items.length ? "0.25rem" : 0 }}
      >
        + Add experience
      </button>

      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </div>
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
