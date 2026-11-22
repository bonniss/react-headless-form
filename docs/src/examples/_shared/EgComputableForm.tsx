import { Form, defineConfig } from "./form.setup";

type ProfileData = {
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  weight: string;
  height: string;
  bmi: number;
};

export default function EgComputableForm() {
  return (
    <Form<ProfileData>
      config={defineConfig<ProfileData>({
        firstName: { type: "text", label: "First name" },
        lastName: { type: "text", label: "Last name" },
        fullName: {
          type: "text",
          label: "Full name",
          readOnly: true,
          compute: (v) => [v.firstName, v.lastName].filter(Boolean).join(" "),
        },
        // computed from a computed field
        initials: {
          type: "text",
          label: "Initials",
          readOnly: true,
          compute: (v) =>
            (v.fullName ?? "")
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0].toUpperCase())
              .join(""),
        },

        weight: { type: "text", label: "Weight (kg)" },
        height: { type: "text", label: "Height (cm)" },
        bmi: {
          type: "text",
          label: "BMI",
          readOnly: true,
          compute: (v) => {
            const weight = Number(v.weight);
            const height = Number(v.height) / 100;
            return weight > 0 && height > 0 ? Math.round((weight / height ** 2) * 10) / 10 : undefined;
          },
        },
      })}
    />
  );
}
