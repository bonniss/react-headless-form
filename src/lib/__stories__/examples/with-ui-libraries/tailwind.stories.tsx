import { useArrayField } from "@/components"
import { defineFieldMapping, setupForm } from "@/components/form/setup"
import { Story, StoryDefault } from "@ladle/react"
import { useState } from "react"
import CheckboxField from "../../components/with-native/CheckboxField"
import InputField from "../../components/with-native/InputField"
import SelectField from "../../components/with-native/SelectField"
import TextAreaField from "../../components/with-native/TextAreaField"
import { UserProfile } from "../types"
import "@/styles/main.css"

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

export const Tailwind: Story = () => {
  const [formData, setFormData] = useState<any>()

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <Form<UserProfile>
        onFormChange={(fd) => setFormData(fd)}
        onSubmit={(fd) => alert(JSON.stringify(fd, null, 2))}
        renderRoot={({ children, onSubmit }) => (
          <form
            onSubmit={onSubmit}
            className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            {children}
          </form>
        )}
        config={defineConfig({
          name: {
            type: "text",
            label: "Name",
            props: { type: "text" },
            rules: { required: "Name is required" },
          },
          password: {
            type: "text",
            label: "Password",
            props: { type: "password" },
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
            render: ({ children, fieldProps: { label } }) => (
              <fieldset className="rounded-md border border-gray-200 p-4 space-y-4">
                <legend className="px-2 text-sm font-semibold text-gray-700">
                  {label}
                </legend>
                {children}
              </fieldset>
            ),
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
                <fieldset className="rounded-md border border-dashed border-gray-300 p-4 space-y-4">
                  <legend className="px-2 text-sm font-semibold text-gray-700">
                    {fieldProps.label}
                  </legend>

                  <div className="space-y-4">{children}</div>

                  <button
                    type="button"
                    onClick={() => append({})}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    + Add Address
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
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </Form>

      <div className="rounded-lg bg-gray-50 p-4">
        <pre className="text-xs text-gray-700">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  )
}
