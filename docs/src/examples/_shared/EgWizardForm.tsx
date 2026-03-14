import { useState } from "react";
import { Form, defineConfig, Section } from "./form.setup";
import { useField } from "react-headless-form";

type AccountData = {
  email: string;
  password: string;
};

type ProfileData = {
  fullName: string;
  bio: string;
};

type PreferencesData = {
  role: string;
  newsletter: boolean;
};

type WizardData = {
  account: AccountData;
  profile: ProfileData;
  preferences: PreferencesData;
};

const accountConfig = defineConfig<AccountData>({
  email: {
    type: "text",
    label: "Email",
    props: { type: "email" },
    rules: { required: "Email is required" },
  },
  password: {
    type: "text",
    label: "Password",
    props: { type: "password" },
    rules: {
      required: "Password is required",
      minLength: { value: 6, message: "At least 6 characters" },
    },
  },
});

const profileConfig = defineConfig<ProfileData>({
  fullName: {
    type: "text",
    label: "Full Name",
    rules: { required: "Full name is required" },
  },
  bio: {
    type: "longText",
    label: "Bio",
    description: "Tell us a bit about yourself",
  },
});

const preferencesConfig = defineConfig<PreferencesData>({
  role: {
    type: "select",
    label: "I am a...",
    defaultValue: "developer",
    rules: { required: "Please select a role" },
    props: {
      options: [
        { label: "Developer", value: "developer" },
        { label: "Designer", value: "designer" },
        { label: "Product Manager", value: "pm" },
      ],
    },
  },
  newsletter: {
    type: "checkbox",
    label: "Send me product updates",
  },
});

const STEPS = ["Account", "Profile", "Preferences"];

function AccountStep() {
  const { visible } = useField();
  if (!visible) return null;
  return <Section<WizardData["account"]> config={accountConfig} />;
}

function ProfileStep() {
  const { visible } = useField();
  if (!visible) return null;
  return <Section<WizardData["profile"]> config={profileConfig} />;
}

function PreferencesStep() {
  const { visible } = useField();
  if (!visible) return null;
  return <Section<WizardData["preferences"]> config={preferencesConfig} />;
}

function EgWizardForm() {
  const [step, setStep] = useState(0);

  return (
    <div>
      {/* Step indicators */}
      <div className="bf-steps">
        {STEPS.map((label, i) => (
          <div
            key={i}
            className={[
              "bf-step",
              i === step ? "bf-step--active" : "",
              i < step ? "bf-step--done" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {i < step ? "✓ " : ""}
            {label}
          </div>
        ))}
      </div>

      <Form<WizardData>
        config={{
          account: {
            type: "section",
            visible: () => step === 0,
            props: { nested: true, component: AccountStep },
          },
          profile: {
            type: "section",
            visible: () => step === 1,
            props: { nested: true, component: ProfileStep },
          },
          preferences: {
            type: "section",
            visible: () => step === 2,
            props: { nested: true, component: PreferencesStep },
          },
        }}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      >
        <div style={{ display: "flex", gap: 8, marginTop: "0.5rem" }}>
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setStep((s) => s + 1);
              }}
              style={{ marginLeft: "auto" }}
            >
              Next →
            </button>
          ) : (
            <button type="submit" style={{ marginLeft: "auto" }}>
              Submit
            </button>
          )}
        </div>
      </Form>
    </div>
  );
}

export default EgWizardForm;
