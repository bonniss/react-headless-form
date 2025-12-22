import { setupForm, createDefineConfigFn } from "@/components/helper"
import { ComponentMap } from "@/types"
import { Story } from "@ladle/react"
import { useState } from "react"
import { UserProfile } from "../example/types"
import InputField from "./InputField"

const fieldMapping = {
  text: InputField,
} as const satisfies ComponentMap

export const configForm = createDefineConfigFn<typeof fieldMapping>()
const [Form, defineConfig] = setupForm({
  fieldMapping,
})

export const FormWithNativeInput: Story = () => {
  const [formData, setFormData] = useState<any>()

  return (
    <>
      <h2>With native input</h2>
      <Form<UserProfile>
        renderRoot={({ children }) => <form>{children}</form>}
        config={defineConfig({
          name: {
            type: "text",
            label: "Name",
            props: {
              className: "input-class",
              placeholder: "Here is a custom placeholder",
              style: {
                color: "red",
              },
            },
          },
        })}
        onFormChange={(fd) => setFormData(fd)}
        onSubmit={(fd) => fd}
      />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  )
}
