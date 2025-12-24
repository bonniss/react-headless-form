/** biome-ignore-all lint/correctness/useHookAtTopLevel: <explanation> */
import { useArrayField } from "@/components"
import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import { Form as AntdForm, Button, Card } from "antd"
import { useState } from "react"
import { UserProfile } from "../types"
import CheckboxField from "../../components/with-antd/CheckboxField"
import InputField from "../../components/with-antd/InputField"
import SelectField from "../../components/with-antd/SelectField"
import TextAreaField from "../../components/with-antd/TextAreaField"

export default {
  title: "With UI Libraries",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
    longText: TextAreaField,
    checkbox: CheckboxField,
    select: SelectField,
  }),
})

export const AntDesign: Story = () => {
  const [formData, setFormData] = useState<any>()

  return (
    <>
      <Form<UserProfile>
        onFormChange={(fd) => setFormData(fd)}
        onSubmit={(fd) => alert(JSON.stringify(fd, null, 2))}
        renderRoot={({ children, onSubmit }) => (
          <AntdForm onFinish={onSubmit}>{children}</AntdForm>
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
                <Card title={label} variant="outlined">
                  {children}
                </Card>
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
                <Card title={fieldProps.label} variant="outlined">
                  {children}
                  <Button onClick={() => append({})}>Add Address</Button>
                </Card>
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
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  )
}
