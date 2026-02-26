import { Story, StoryDefault } from "@ladle/react"
import { setupForm, defineMapping } from "@/components/form/setup"
import { useArrayField, useField } from "@/components"
import InputField from "../../components/with-native/InputField"
import CheckboxField from "../../components/with-native/CheckboxField"

/**
 * Cấu trúc dữ liệu:
 * - tasks: Array
 * - mainInfo: Nested Object { title, priority }
 * - description: string (flat)
 * - isDone: boolean (flat)
 */
interface Task {
  title: string
  priority: string
}

interface TaskItem {
  mainInfo: Task
  description: string
  isDone: boolean
}

interface ProjectForm {
  projectName: string
  tasks: TaskItem[]
}

export default {
  title: "Mixed",
} satisfies StoryDefault

const [Form, defineConfig, Section] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
    checkbox: CheckboxField,
  }),
})

/**
 * Component cho Nested Section: mainInfo
 * Tự định nghĩa schema và layout cho sub-object
 */
function TaskMainInfo() {
  const { fieldProps } = useField()
  return (
    <div className="p-3 bg-blue-50 rounded-t-lg border-b border-blue-200">
      <div className="text-xs font-bold text-blue-500 uppercase mb-2">
        {fieldProps.label}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Section<Task>
          config={{
            title: { type: "text", label: "Task Title" },
            priority: { type: "text", label: "Priority (High/Low)" },
          }}
        />
      </div>
    </div>
  )
}

export const ArrayComponentSection: Story = () => {
  return (
    <Form<ProjectForm>
      renderRoot={({ children, onSubmit }) => (
        <form onSubmit={onSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
          {children}
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded font-bold"
          >
            Submit Project
          </button>
        </form>
      )}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={{
        projectName: {
          type: "text",
          label: "Project Name",
          defaultValue: "My New Project",
        },

        tasks: {
          type: "array",
          label: "Tasks List",
          render: ({ children }) => {
            const { controller } = useArrayField()
            return (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Tasks</h3>
                  <button
                    type="button"
                    className="px-3 py-1 bg-black text-white text-xs rounded"
                    onClick={() => controller.append({ isDone: false })}
                  >
                    + Add Task
                  </button>
                </div>
                {children}
              </div>
            )
          },
          props: {
            config: defineConfig<TaskItem>({
              // 1. NESTED SECTION: profile[i].mainInfo = { title, priority }
              mainInfo: {
                type: "section",
                label: "Core Task Info",
                props: {
                  nested: true,
                  component: TaskMainInfo,
                },
              },

              // 2. FLAT FIELD
              isDone: {
                type: "checkbox",
                label: "Mark as completed",
                defaultValue: false,
              },
            }),
          },
        },
      }}
    />
  )
}
