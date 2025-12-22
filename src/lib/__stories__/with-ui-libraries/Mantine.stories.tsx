import { useArrayField } from "@/components"
import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import { Button, Fieldset, MantineProvider } from "@mantine/core"
import "@mantine/core/styles.css"
import { useState } from "react"
import { UserProfile } from "../example/types"
import CheckboxField from "../components/with-mantine/CheckboxField"
import InputField from "../components/with-mantine/InputField"
import SelectField from "../components/with-mantine/SelectField"
import TextAreaField from "../components/with-mantine/TextAreaField"

export default {
  title: "With UI Libraries",
} satisfies StoryDefault;

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
    longText: TextAreaField,
    checkbox: CheckboxField,
    select: SelectField,
  }),
})

export const Mantine: Story = () => {
  const [formData, setFormData] = useState<any>()

  return (
    <>
      <Form<UserProfile>
        onFormChange={(fd) => setFormData(fd)}
        onSubmit={(fd) => alert(JSON.stringify(fd, null, 2))}
        renderRoot={({ children, onSubmit }) => (
          <MantineProvider>
            <form onSubmit={onSubmit}>{children}</form>
          </MantineProvider>
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
              data: [
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
              ],
            },
          },
          settings: {
            type: "group",
            label: "Settings",
            render: ({ children, fieldProps: { label } }) => {
              return <Fieldset legend={label}>{children}</Fieldset>
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
                    data: [
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
                <Fieldset legend={fieldProps.label}>
                  {children}
                  <Button type="button" onClick={() => append({})}>
                    Add Address
                  </Button>
                </Fieldset>
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
        <Button type="submit">Submit</Button>
      </Form>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  )
}
