// section-component.stories.tsx
/**
 * Demonstrates component-owned sections using `section.props.component`.
 *
 * - `component` is prioritized over `config`
 * - The component can use `useField()` to access:
 *   - label
 *   - visible
 *   - namespace
 * - `<Section />` renders a typed config fragment at the current namespace
 */

import { defineMapping, setupForm } from "@/components/form/setup"
import { useField } from "@/components/form/provider"
import { Story, StoryDefault } from "@ladle/react"
import InputField from "../../components/with-native/InputField"

interface Profile {
  firstName: string
  lastName: string
}

interface FormModel {
  profile: Profile
}

export default {
  title: "Core",
} satisfies StoryDefault

const [Form, defineConfig, Section] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
  fieldMapping: defineMapping({
    text: InputField,
  }),
})

/**
 * Component-owned section
 *
 * This component:
 * - controls its own layout
 * - renders its own schema fragment
 * - does not rely on parent `config`
 */
function ProfileSection() {
  const { fieldProps } = useField()

  if (!fieldProps.visible) return null

  return (
    <fieldset style={{ padding: 16, border: "1px solid #ddd" }}>
      <legend>{fieldProps.label}</legend>

      <Section<Profile>
        config={{
          firstName: {
            type: "text",
            label: "First name",
            defaultValue: "John",
          },
          lastName: {
            type: "text",
            label: "Last name",
            defaultValue: "Doe",
          },
        }}
      />
    </fieldset>
  )
}

export const SectionWithComponent: Story = () => {
  return (
    <Form<FormModel>
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={{
        profile: {
          type: "section",
          label: "Profile (component-owned)",
          props: {
            nested: true,
            component: ProfileSection,
          },
        },
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  )
}

SectionWithComponent.storyName = "Builtin types: Section (component-owned)"
