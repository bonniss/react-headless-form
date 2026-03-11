import { Form } from "./form.setup";

type ContactData = {
  name: string;
  contact_method: string;
  email: string;
  phone: string;
  message: string;
  subscribe: boolean;
  newsletter_frequency: string;
};

function EgConditionalForm() {
  return (
    <Form<ContactData>
      config={{
        name: {
          type: "text",
          label: "Full Name",
          rules: { required: "Name is required" },
        },
        contact_method: {
          type: "select",
          label: "Preferred Contact Method",
          rules: { required: "Please select a contact method" },
          props: {
            options: [
              { label: "Email", value: "email" },
              { label: "Phone", value: "phone" },
            ],
          },
          defaultValue: "email",
        },
        email: {
          type: "text",
          label: "Email Address",
          props: { type: "email" },
          visible: (values) => values.contact_method === "email",
          rules: {
            validate: (value, values) =>
              values.contact_method !== "email" ||
              Boolean(value) ||
              "Email is required",
          },
        },
        phone: {
          type: "text",
          label: "Phone Number",
          props: { type: "tel" },
          visible: (values) => values.contact_method === "phone",
          rules: {
            validate: (value, values) =>
              values.contact_method !== "phone" ||
              Boolean(value) ||
              "Phone number is required",
          },
        },
        message: {
          type: "longText",
          label: "Message",
          rules: { required: "Message is required" },
        },
        subscribe: {
          type: "checkbox",
          label: "Subscribe to newsletter",
        },
        newsletter_frequency: {
          type: "select",
          label: "Newsletter Frequency",
          visible: (values) => Boolean(values.subscribe),
          rules: {
            validate: (value, values) =>
              !values.subscribe ||
              Boolean(value) ||
              "Please select a frequency",
          },
          props: {
            options: [
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
            ],
          },
          defaultValue: "daily",
        },
      }}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
    >
      <button type="submit">Send</button>
    </Form>
  );
}

export default EgConditionalForm;
