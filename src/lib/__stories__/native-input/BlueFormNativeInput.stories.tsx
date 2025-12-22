import { setupForm } from "@/components/helper"
import { ComponentMap } from "@/types"
import { Story } from "@ladle/react"
import { useState } from "react"
import { UserProfile } from "../example/types"
import InputField from "./InputField"

const fieldMapping = {
  text: InputField,
  hana: InputField,
  hoho: InputField,
} as const satisfies ComponentMap

const [Form, defineConfig] = setupForm({
  fieldMapping,
})

export const FormWithNativeInput: Story = () => {
  const [formData, setFormData] = useState<any>()

  return (
    <>
      <h2>With native input</h2>
      <Form<UserProfile>
        onFormChange={(fd) => setFormData(fd)}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={defineConfig({
          name: {
            type: "hoho",
            label: "Name",
            props: {
              className: "input-class",
              placeholder: "Here is a custom placeholder",
              style: {
                color: "red",
              },
            },
            rules: { required: "Name is required" },
          },
        })}
      />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  )
}
