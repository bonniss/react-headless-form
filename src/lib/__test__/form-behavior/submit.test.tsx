import { BlueForm, HiddenField } from '@/components';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithBlueFormProvider } from '../_utils/render-form';

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

describe('BlueForm – onSubmit', () => {
  it('calls onSubmit with resolved form values', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => {
          submitted = data;
        }}
        config={{
          profile: {
            type: 'group',
            props: {
              config: {
                userId: {
                  type: 'hidden',
                  defaultValue: 'u-123',
                },
              },
            },
          },
        }}
        fieldMapping={{
          group: ({ children }: any) => children,
          hidden: HiddenField,
        }}
      />
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          userId: 'u-123',
        },
      });
    });
  });

  it('calls onSubmitSuccess after onSubmit', async () => {
    const calls: string[] = [];

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={() => {
          calls.push('submit');
        }}
        onSubmitSuccess={() => {
          calls.push('success');
        }}
        config={{
          name: {
            type: 'inline',
            render: () => null,
          },
        }}
      />
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(calls).toEqual(['submit', 'success']);
    });
  });

  it('calls onSubmitError when validation fails', async () => {
    const onSubmit = vi.fn();
    const onSubmitError = vi.fn();

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        onSubmitError={onSubmitError}
        config={{
          name: {
            type: 'inline',
            rules: {
              required: true,
            },
            render: () => null,
          },
        }}
      />
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onSubmitError).toHaveBeenCalled();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmitError when form is valid', async () => {
    const onSubmitError = vi.fn();

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={() => {}}
        onSubmitError={onSubmitError}
        config={{
          name: {
            type: 'inline',
            render: () => null,
          },
        }}
      />
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onSubmitError).not.toHaveBeenCalled();
    });
  });

  it('supports custom validate rule on submit', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => {
          submitted = data;
        }}
        config={{
          name: {
            type: 'hidden',
            defaultValue: 'ok',
            rules: {
              validate: (value: string) => value === 'ok' || 'Invalid',
            },
          },
        }}
        fieldMapping={{
          hidden: HiddenField,
        }}
      />
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({ name: 'ok' });
    });
  });

  it('submits a stable snapshot of form values', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => {
          submitted = data;
        }}
        onSubmitSuccess={(data, form) => {
          form.setValue('name', 'changed-after-submit');
        }}
        config={{
          name: {
            type: 'hidden',
            defaultValue: 'initial',
          },
        }}
        fieldMapping={{
          hidden: HiddenField,
        }}
      />
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({ name: 'initial' });
    });
  });
});
