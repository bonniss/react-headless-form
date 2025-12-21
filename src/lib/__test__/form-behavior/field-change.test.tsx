import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlueForm } from '@/components';
import { renderWithBlueFormProvider } from '../_utils/render-form';

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>{children}</form>
);

describe('BlueForm – onFieldChange behavior', () => {
  it('calls onFieldChange with correct name and value for top-level field', async () => {
    const calls: any[] = [];

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFieldChange={(name, value) => {
          calls.push({ name, value });
        }}
        config={{
          name: {
            type: 'inline',
            render: ({ fieldProps: { onChange } }) => (
              <button
                type="button"
                data-testid="change"
                onClick={() => {
                  onChange?.('Alice');
                }}
              >
                change
              </button>
            ),
          },
        }}
      />
    );

    fireEvent.click(screen.getByTestId('change'));

    await waitFor(() => {
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toEqual({
        name: 'name',
        value: 'Alice',
      });
    });
  });

  it('calls onFieldChange with nested path and correct value', async () => {
    const calls: any[] = [];

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFieldChange={(name, value) => {
          calls.push({ name, value });
        }}
        fieldMapping={{
          group: ({ children }) => children,
        }}
        config={{
          profile: {
            type: 'group',
            props: {
              config: {
                userId: {
                  type: 'inline',
                  render: ({ fieldProps: { onChange } }) => (
                    <button
                      type="button"
                      data-testid="change"
                      onClick={() => {
                        onChange?.('u-123');
                      }}
                    >
                      change
                    </button>
                  ),
                },
              },
            },
          },
        }}
      />
    );

    fireEvent.click(screen.getByTestId('change'));

    await waitFor(() => {
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toEqual({
        name: 'profile.userId',
        value: 'u-123',
      });
    });
  });

  // it('does not call onFieldChange when value does not change', async () => {
  //   const calls: any[] = [];

  //   renderWithBlueFormProvider(
  //     <BlueForm
  //       renderRoot={TestRoot}
  //       onFieldChange={(name, value) => {
  //         calls.push({ name, value });
  //       }}
  //       config={{
  //         name: {
  //           type: 'inline',
  //           render: ({ fieldProps: { onChange } }) => (
  //             <button
  //               type="button"
  //               data-testid="change"
  //               onClick={() => {
  //                 onChange?.(undefined);
  //               }}
  //             >
  //               change
  //             </button>
  //           ),
  //         },
  //       }}
  //     />
  //   );

  //   fireEvent.click(screen.getByTestId('change'));

  //   await waitFor(() => {
  //     expect(calls.length).toBe(0);
  //   });
  // });

  it('calls onFieldChange for each value change', async () => {
    const calls: any[] = [];

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFieldChange={(name, value) => {
          calls.push({ name, value });
        }}
        config={{
          name: {
            type: 'inline',
            render: ({ fieldProps: { onChange } }) => (
              <>
                <button
                  type="button"
                  data-testid="a"
                  onClick={() => onChange?.('A')}
                >
                  Change to A
                </button>
                <button
                  type="button"
                  data-testid="b"
                  onClick={() => onChange?.('B')}
                >
                  Change to B
                </button>
              </>
            ),
          },
        }}
      />
    );

    fireEvent.click(screen.getByTestId('a'));
    fireEvent.click(screen.getByTestId('b'));

    await waitFor(() => {
      expect(calls).toEqual([
        { name: 'name', value: 'A' },
        { name: 'name', value: 'B' },
      ]);
    });
  });
});
