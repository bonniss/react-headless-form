import { useState } from "react";
import { Form, defineConfig, Section } from "./form.setup";

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

// Each step: a label, the section to show, and the paths to validate on "Next".
const STEPS = [
  { label: "Account", section: "account", paths: ["account.email", "account.password"] },
  { label: "Profile", section: "profile", paths: ["profile.fullName", "profile.bio"] },
  { label: "Preferences", section: "preferences", paths: ["preferences.role", "preferences.newsletter"] },
] as const;

function AccountStep() {
  return <Section<WizardData["account"]> config={accountConfig} />;
}

function ProfileStep() {
  return <Section<WizardData["profile"]> config={profileConfig} />;
}

function PreferencesStep() {
  return <Section<WizardData["preferences"]> config={preferencesConfig} />;
}

function EgWizardForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<WizardData>();

  return (
    <div>
      {/* Step indicators */}
      <div className="bf-steps">
        {STEPS.map(({ label }, i) => (
          <div
            key={label}
            className={["bf-step", i === step ? "bf-step--active" : "", i < step ? "bf-step--done" : ""]
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
          // Step state lives outside the form; each step is a section shown
          // only on its step. Hidden steps keep their values (shouldUnregister
          // is false by default).
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
        onSubmit={(data) => setSubmitted(data)}
      >
        {({ trigger }) => (
          <div>
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)}>
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                // Validate only the current step before moving on.
                onClick={async () => {
                  if (await trigger([...STEPS[step].paths])) setStep((s) => s + 1);
                }}
              >
                Next →
              </button>
            ) : (
              <button type="submit">
                Submit
              </button>
            )}
          </div>
        )}
      </Form>
      {submitted && <pre data-testid="output">{JSON.stringify(submitted, null, 2)}</pre>}
    </div>
  );
}

export default EgWizardForm;
