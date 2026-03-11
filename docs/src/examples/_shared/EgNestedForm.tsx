import { Form, defineConfig } from "./form.setup";

type AddressData = {
  street: string;
  city: string;
  country: string;
};

type ProfileData = {
  fullName: string;
  email: string;
  address: AddressData;
};

const addressConfig = defineConfig<AddressData>({
  street: {
    type: "text",
    label: "Street",
    rules: { required: "Street is required" },
  },
  city: {
    type: "text",
    label: "City",
    rules: { required: "City is required" },
  },
  country: {
    type: "text",
    label: "Country",
    rules: { required: "Country is required" },
  },
});

function EgNestedForm() {
  return (
    <Form<ProfileData>
      config={{
        fullName: {
          type: "text",
          label: "Full Name",
          rules: { required: "Full name is required" },
        },
        email: {
          type: "text",
          label: "Email",
          props: { type: "email" },
          rules: { required: "Email is required" },
        },
        address: {
          type: "section",
          label: "Address",
          props: {
            nested: true,
            config: addressConfig,
          },
        },
      }}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
    >
      <button type="submit">Save profile</button>
    </Form>
  );
}

export default EgNestedForm;
