import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlueForm, useField } from '@/components';
import { renderWithBlueFormProvider } from '../_utils/render-form';

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

describe('BlueForm – inline & custom field', () => {
  it('inline field receives fieldProps and updates value', async () => {
    let snapshot: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          name: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <button
                type="button"
                onClick={() => fieldProps.onChange?.('Alice')}
              >
                Set Name
              </button>
            ),
          },
        }}
      />
    );

    fireEvent.click(screen.getByText('Set Name'));

    await waitFor(() => {
      expect(snapshot).toEqual({ name: 'Alice' });
    });
  });

  it('inline field respects namespace when inside group', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          profile: {
            type: 'group',
            props: {
              config: {
                name: {
                  type: 'inline',
                  render: ({ fieldProps }) => (
                    <button
                      type="button"
                      onClick={() => fieldProps.onChange?.('Bob')}
                    >
                      Set Name
                    </button>
                  ),
                },
              },
            },
          },
        }}
      />
    );

    fireEvent.click(screen.getByText('Set Name'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          name: 'Bob',
        },
      });
    });
  });

  it('renders custom field from fieldMapping and submits value', async () => {
    let submitted: any = null;

    const CustomField = () => {
      const { fieldProps } = useField();
      return (
        <button type="button" onClick={() => fieldProps.onChange?.('Custom')}>
          Set Custom
        </button>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          title: {
            type: 'custom',
          },
        }}
        fieldMapping={{
          custom: CustomField,
        }}
      />
    );

    fireEvent.click(screen.getByText('Set Custom'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        title: 'Custom',
      });
    });
  });

  it('custom field works correctly inside ui and group', async () => {
    let submitted: any = null;

    const CustomField = () => {
      const { fieldProps } = useField();
      return (
        <button type="button" onClick={() => fieldProps.onChange?.('X')}>
          Set Value
        </button>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          layout: {
            type: 'ui',
            props: {
              config: {
                profile: {
                  type: 'group',
                  props: {
                    config: {
                      code: {
                        type: 'custom',
                      },
                    },
                  },
                },
              },
            },
          },
        }}
        fieldMapping={{
          custom: CustomField,
        }}
      />
    );

    fireEvent.click(screen.getByText('Set Value'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          code: 'X',
        },
      });
    });
  });

  it('supports inline and custom fields together', async () => {
    let submitted: any = null;

    const CustomField = () => {
      const { fieldProps } = useField();
      return (
        <button type="button" onClick={() => fieldProps.onChange?.(42)}>
          Set Age
        </button>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          name: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <button
                type="button"
                onClick={() => fieldProps.onChange?.('Alice')}
              >
                Set Name
              </button>
            ),
          },
          age: {
            type: 'custom',
          },
        }}
        fieldMapping={{
          custom: CustomField,
        }}
      />
    );

    fireEvent.click(screen.getByText('Set Name'));
    fireEvent.click(screen.getByText('Set Age'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        name: 'Alice',
        age: 42,
      });
    });
  });
});
