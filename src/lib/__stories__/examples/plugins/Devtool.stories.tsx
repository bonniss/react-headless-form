/** biome-ignore-all lint/correctness/useHookAtTopLevel: <explanation> */
import { useArrayField } from "@/components"
import { defineMapping, setupForm } from "@/components/form/setup"
import { DevTool } from "@hookform/devtools"
import { Story, StoryDefault } from "@ladle/react"
import { useFormContext } from "react-hook-form"
import CheckboxField from "../../components/with-native/CheckboxField"
import InputField from "../../components/with-native/InputField"
import SelectField from "../../components/with-native/SelectField"
import TextAreaField from "../../components/with-native/TextAreaField"
import { UserProfile } from "../types"

export default {
  title: "Plugins",
} satisfies StoryDefault

const [Form, defineConfig] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
    longText: TextAreaField,
    checkbox: CheckboxField,
    select: SelectField,
  }),
})

export const DevToolStory: Story = () => {
  return (
    <>
      <Form<UserProfile>
        onSubmit={(fd) => alert(JSON.stringify(fd, null, 2))}
        renderRoot={({ children, onSubmit }) => {
          const { control } = useFormContext()

          return (
            <>
              <form onSubmit={onSubmit}>{children}</form>
              <DevTool control={control} placement="top-left" />
            </>
          )
        }}
        config={{
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
            type: "section",
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
              nested: true,
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
              const { append } = useArrayField()
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
        }}
      >
        <button type="submit">Submit</button>
      </Form>
    </>
  )
}
