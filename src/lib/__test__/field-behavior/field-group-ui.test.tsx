import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlueForm, HiddenField } from '@/components';
import { renderWithBlueFormProvider } from '../_utils/render-form';

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

describe('BlueForm – group & ui', () => {
  it('groups child fields under namespace', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
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

  it('supports nested groups', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          profile: {
            type: 'group',
            props: {
              config: {
                address: {
                  type: 'group',
                  props: {
                    config: {
                      city: {
                        type: 'hidden',
                        defaultValue: 'HN',
                      },
                    },
                  },
                },
              },
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
      expect(submitted).toEqual({
        profile: {
          address: {
            city: 'HN',
          },
        },
      });
    });
  });

  it('ui does not create namespace for child fields', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          layout: {
            type: 'ui',
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
          hidden: HiddenField,
        }}
      />
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        userId: 'u-123',
      });
    });
  });

  it('combines ui and group correctly', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          layout: {
            type: 'ui',
            props: {
              config: {
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
              },
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
      expect(submitted).toEqual({
        profile: {
          userId: 'u-123',
        },
      });
    });
  });

  it('group render does not affect namespace behavior', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          profile: {
            type: 'group',
            render: ({ children }) => (
              <div data-testid="wrapper">{children}</div>
            ),
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
          hidden: HiddenField,
        }}
      />
    );

    expect(screen.getByTestId('wrapper')).toBeDefined();

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          userId: 'u-123',
        },
      });
    });
  });
});
