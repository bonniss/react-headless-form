import InputField from "@/__stories__/components/with-native/InputField"
import { defineMapping, setupForm } from "@/components/form/setup"

export const [Form, defineConfig] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
  }),
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit} data-testid="form">
      {children}
    </form>
  ),
})

export const loginFormConfig = defineConfig<LoginData>({
  username: {
    type: "text",
  },
  password: {
    type: "text",
    props: {
      type: "password",
    },
  },
})

export type LoginData = {
  username: string
  password: string
}
