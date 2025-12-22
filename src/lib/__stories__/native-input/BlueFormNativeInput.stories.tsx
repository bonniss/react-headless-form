import { Story } from "@ladle/react"
import BlueForm from "@/components/form/BlueForm"
import InputField from "./InputField"

export const FormWithNativeInput: Story = () => {
  return (
    <>
      <h2>Form with native input</h2>
      <BlueForm
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          name: { type: "text" },
        }}
        fieldMapping={{
          text: InputField,
        }}
      />
    </>
  )
}
