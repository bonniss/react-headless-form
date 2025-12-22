import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story } from "@ladle/react"
import { useState } from "react"
import { UserProfile } from "../example/types"
import CheckboxField from "./CheckboxField"
import InputField from "./InputField"
import TextAreaField from "./TextAreaField"

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
    longText: TextAreaField,
    checkbox: CheckboxField,
  }),
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
            type: "text",
            label: "Name",
            props: {
              type: "text",
            },
            rules: {
              required: true,
            },
          },
          password: {
            type: "text",
            label: "Password",
            props: {
              type: "password",
            },
          },
          bio: {
            type: "longText",
            label: "Bio",
          },
          settings: {
            type: "group",
            label: "Settings",
            render: ({ children, fieldProps: {
              label,
            } }) => {
              return (
                <fieldset>
                  <legend>{label}</legend>
                  {children}
                </fieldset>
              )
            },
            props: {
              config: defineConfig<UserProfile["settings"]>({
                newsletter: {
                  type: "checkbox",
                  label: "Newsletter",
                },
                theme: {
                  type: "text",
                  label: "Theme",
                },
              }),
            },
          },
        })}
      />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  )
}
