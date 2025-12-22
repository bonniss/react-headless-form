import { useArrayField } from "@/components"
import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story } from "@ladle/react"
import { useState } from "react"
import { UserProfile } from "../example/types"
import CheckboxField from "./CheckboxField"
import InputField from "./InputField"
import SelectField from "./SelectField"
import TextAreaField from "./TextAreaField"

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
    longText: TextAreaField,
    checkbox: CheckboxField,
    select: SelectField,
  }),
})

export const NativeFormWithNativeInput: Story = () => {
  const [formData, setFormData] = useState<any>()
  return (
    <>
      <Form<UserProfile>
        onFormChange={(fd) => setFormData(fd)}
        onSubmit={(fd) => alert(JSON.stringify(fd, null, 2))}
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
              required: "Name is required",
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
          role: {
            type: "select",
            label: "Role",
            props: {
              options: [
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
              ],
            },
          },
          settings: {
            type: "group",
            label: "Settings",
            render: ({ children, fieldProps: { label } }) => {
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
                  type: "select",
                  label: "Theme",
                  props: {
                    options: [
                      { value: "light", label: "Light" },
                      { value: "dark", label: "Dark" },
                    ],
                  },
                },
              }),
            },
          },
          addresses: {
            type: "array",
            label: "Address book",
            render: ({ fieldProps, children }) => {
              const {
                controller: { append },
              } = useArrayField()
              return (
                <fieldset>
                  <legend>{fieldProps.label}</legend>
                  {children}
                  <button type="button" onClick={() => append({})}>
                    Add Address
                  </button>
                </fieldset>
              )
            },
            props: {
              config: defineConfig<UserProfile["addresses"][number]>({
                street: {
                  type: "text",
                  label: "Street",
                },
                city: {
                  type: "text",
                  label: "City",
                },
              }),
            },
          },
        })}
      >
        <button type="submit">Submit</button>
      </Form>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  )
}
