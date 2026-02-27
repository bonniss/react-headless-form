/**
 * Demonstrates dynamic array fields.
 * Array fields allow runtime addition and removal of field groups.
 */
/** biome-ignore-all lint/correctness/useHookAtTopLevel: <explanation> */
import { setupForm, defineMapping } from '@/components/form/setup';
import { Story, StoryDefault } from '@ladle/react';
import { useArrayField } from '@/components';
import InputField from '../../components/with-native/InputField';

interface User {
  fullName: string
  addresses: {
    street: string;
    city: string;
  }[];
}

export default {
  title: 'Core',
} satisfies StoryDefault;

const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
  fieldMapping: defineMapping({
    text: InputField,
  }),
});

export const ArrayFields: Story = () => {
  return (
    <Form<User>
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      config={{
        fullName: {
          type: 'text',
          label: 'Full name',
          rules: {
            required: 'Full name is required',
          }
        },
        addresses: {
          type: 'array',
          label: 'Addresses',
          rules: {
            required: 'Addresses are required',
            minLength: {
              value: 2,
              message: 'At least 2 addresses are required',
            },
          },
          props: {
            config: defineConfig<User['addresses'][number]>({
              street: {
                type: 'text',
                label: 'Street',
                rules: {
                  required: true,
                },
              },
              city: {
                type: 'text',
                label: 'City',
              },
            }),
          },
          render: ({ fieldProps, children }) => {
            const {
              controller: { append },
            } = useArrayField();

            return (
              <fieldset>
                <legend>{fieldProps.label}</legend>
                {children}
                <button type="button" onClick={() => append({})}>
                  Add address
                </button>
                {fieldProps.errorMessage && (
                  <p style={{ color: 'red' }}>{fieldProps.errorMessage}</p>
                )}
              </fieldset>
            );
          },
        },
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  );
};

ArrayFields.storyName = 'Builtin types: Array field';
