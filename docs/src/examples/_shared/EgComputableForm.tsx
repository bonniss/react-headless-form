import { Form, defineConfig } from "./form.setup";

type ProfileData = {
  title: string;
  slug: string;
  firstName: string;
  lastName: string;
  fullName: string;
  weight: number;
  height: number;
  bmi: number;
};

export default function EgComputableForm() {
  return (
    <Form<ProfileData>
      onFieldChange={({ name, value, values, setValue }) => {
        if (name === "title") {
          setValue("slug", (value as string)?.toLowerCase().replace(/\s+/g, "-") ?? "")
        }

        if (name === "firstName" || name === "lastName") {
          const { firstName, lastName } = values
          setValue("fullName", [firstName, lastName].filter(Boolean).join(" "))
        }

        if (name === "weight" || name === "height") {
          const { weight, height } = values
          if (weight && height) {
            const h = height / 100
            setValue("bmi", Math.round((weight / (h * h)) * 10) / 10)
          }
        }
      }}
      config={defineConfig<ProfileData>({
        title: { type: "text", label: "Title" },
        slug: { type: "text", label: "Slug", readOnly: true },

        firstName: { type: "text", label: "First name" },
        lastName: { type: "text", label: "Last name" },
        fullName: { type: "text", label: "Full name", readOnly: true },

        weight: { type: "text", label: "Weight (kg)" },
        height: { type: "text", label: "Height (cm)" },
        bmi: { type: "text", label: "BMI", readOnly: true },
      })}
    />
  )
}
