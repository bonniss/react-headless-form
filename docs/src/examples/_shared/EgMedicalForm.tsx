import { Form, defineConfig } from "./form.setup";

type Checkup = {
  sex: "F" | "M" | "";
  age: string;
  weight: string;
  height: string;
  creatinine: string;
  bmi: number;
  bmiClass: string;
  bsa: number;
  egfr: number;
  alert: string;
};

const num = (v: unknown) => (v === "" || v == null ? undefined : Number(v));
const round = (n: number, digits = 1) => Math.round(n * 10 ** digits) / 10 ** digits;

const config = defineConfig<Checkup>({
  sex: {
    type: "select",
    label: "Sex",
    props: {
      options: [
        { value: "", label: "—" },
        { value: "F", label: "Female" },
        { value: "M", label: "Male" },
      ],
    },
  },
  age: { type: "text", label: "Age" },
  weight: { type: "text", label: "Weight (kg)" },
  height: { type: "text", label: "Height (cm)" },
  creatinine: { type: "text", label: "Serum creatinine (mg/dL)" },

  // Body mass index
  bmi: {
    type: "text",
    label: "BMI",
    readOnly: true,
    compute: (v) => {
      const w = num(v.weight);
      const h = num(v.height);
      return w && h ? round(w / (h / 100) ** 2) : undefined;
    },
  },
  // Classification from the computed BMI (Asia-Pacific cut-offs)
  bmiClass: {
    type: "text",
    label: "BMI class",
    readOnly: true,
    compute: (v) =>
      v.bmi === undefined
        ? undefined
        : v.bmi < 18.5
          ? "Underweight"
          : v.bmi < 23
            ? "Normal"
            : v.bmi < 25
              ? "Overweight"
              : "Obese",
  },
  // Body surface area (Mosteller)
  bsa: {
    type: "text",
    label: "BSA (m²)",
    readOnly: true,
    compute: (v) => {
      const w = num(v.weight);
      const h = num(v.height);
      return w && h ? round(Math.sqrt((w * h) / 3600), 2) : undefined;
    },
  },
  // Kidney function: CKD-EPI 2021
  egfr: {
    type: "text",
    label: "eGFR (mL/min/1.73m²)",
    readOnly: true,
    compute: (v) => {
      const scr = num(v.creatinine);
      const age = num(v.age);
      if (!scr || !age || !v.sex) return undefined;
      const female = v.sex === "F";
      const k = female ? 0.7 : 0.9;
      const a = female ? -0.241 : -0.302;
      return Math.round(
        142 * Math.min(scr / k, 1) ** a * Math.max(scr / k, 1) ** -1.2 * 0.9938 ** age * (female ? 1.012 : 1),
      );
    },
  },
  alert: {
    type: "text",
    label: "Alert",
    readOnly: true,
    compute: (v) =>
      [v.bmiClass === "Obese" && "Refer to nutrition", v.egfr !== undefined && v.egfr < 60 && "Reduced kidney function"]
        .filter(Boolean)
        .join("; "),
  },
});

export default function EgMedicalForm() {
  return <Form<Checkup> config={config} defaultValues={{ sex: "" }} />;
}
