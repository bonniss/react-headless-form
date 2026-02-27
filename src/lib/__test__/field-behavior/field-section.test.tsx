/** biome-ignore-all lint/suspicious/noAssignInExpressions: legacy test style */
import BlueForm from '@/components/form/BlueForm';
import { HiddenField } from '@/components/form/field';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithBlueFormProvider } from '../_utils/render-form';
import { useArrayField } from '@/components';

/**
 * A minimal root renderer for BlueForm tests.
 * - Renders `children`
 * - Includes a submit button to trigger `onSubmit`
 */
const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

describe('BlueForm – section', () => {
  it('nests child fields under the section key when nested=true', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          profile: {
            type: 'section',
            props: {
              nested: true,
              config: {
                name: {
                  type: 'hidden',
                  defaultValue: 'Bob',
                },
              },
            },
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: { name: 'Bob' },
      });
    });
  });

  it('does not create a namespace when nested=false (flat section)', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          layout: {
            type: 'section',
            props: {
              nested: false,
              config: {
                name: {
                  type: 'hidden',
                  defaultValue: 'Charlie',
                },
              },
            },
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        name: 'Charlie',
      });
    });
  });

  it('defaults nested to false when omitted', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          layout: {
            type: 'section',
            props: {
              // nested omitted
              config: {
                userId: {
                  type: 'hidden',
                  defaultValue: 'u-123',
                },
              },
            },
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        userId: 'u-123',
      });
    });
  });

  it('supports nested sections (nested=true across multiple levels)', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          profile: {
            type: 'section',
            props: {
              nested: true,
              config: {
                address: {
                  type: 'section',
                  props: {
                    nested: true,
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
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: { address: { city: 'HN' } },
      });
    });
  });

  it('supports flat section containing a nested section (nested=false then nested=true)', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          layout: {
            type: 'section',
            props: {
              nested: false,
              config: {
                profile: {
                  type: 'section',
                  props: {
                    nested: true,
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
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: { userId: 'u-123' },
      });
    });
  });

  it('render wrapper does not affect namespace behavior (nested=true)', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          profile: {
            type: 'section',
            props: {
              nested: true,
              config: {
                userId: {
                  type: 'hidden',
                  defaultValue: 'u-123',
                },
              },
            },
            render: ({ children }) => (
              <div data-testid="wrapper">{children}</div>
            ),
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    expect(screen.getByTestId('wrapper')).toBeDefined();

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: { userId: 'u-123' },
      });
    });
  });

  it('render wrapper does not affect namespace behavior (nested=false)', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          layout: {
            type: 'section',
            props: {
              nested: false,
              config: {
                userId: {
                  type: 'hidden',
                  defaultValue: 'u-123',
                },
              },
            },
            render: ({ children }) => (
              <div data-testid="wrapper">{children}</div>
            ),
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    expect(screen.getByTestId('wrapper')).toBeDefined();

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        userId: 'u-123',
      });
    });
  });

  it('prioritizes section.component over section.config and warns (component wins)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let submitted: any = null;

    const StubSection = () => (
      <div data-testid="component-section">Component Section</div>
    );

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          profile: {
            type: 'section',
            props: {
              nested: true,
              component: StubSection,
              config: {
                // should be ignored because component wins
                userId: {
                  type: 'hidden',
                  defaultValue: 'u-ignored',
                },
              },
            },
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    // component renders, config should be ignored (no HiddenField child)
    expect(screen.getByTestId('component-section')).toBeTruthy();

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalled();
      // since config is ignored and component doesn't register fields,
      // submission should not contain profile.userId
      expect(submitted).toEqual({});
    });

    warnSpy.mockRestore();
  });

  it('renders a section with only component (no config)', async () => {
    let submitted: any = null;

    const StubSection = () => (
      <div data-testid="component-only">Component Only</div>
    );

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          profile: {
            type: 'section',
            props: {
              nested: true,
              component: StubSection,
            },
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    expect(screen.getByTestId('component-only')).toBeTruthy();

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({});
    });
  });

  it('renders a section with only config (no component)', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          profile: {
            type: 'section',
            props: {
              nested: true,
              config: {
                userId: {
                  type: 'hidden',
                  defaultValue: 'u-123',
                },
              },
            },
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: { userId: 'u-123' },
      });
    });
  });

  it("supports flat path field keys like 'nested.key' (independent of section)", () => {
    render(
      <BlueForm
        renderRoot={({ children }) => <form>{children}</form>}
        config={{
          'nested.key': {
            type: 'inline',
            render: () => <input data-testid="input" />,
          },
        }}
      />,
    );

    expect(screen.getByTestId('input')).toBeTruthy();
  });

  it('maps flat path values into nested objects on submit', async () => {
    const onSubmit = vi.fn();

    render(
      <BlueForm
        onSubmit={onSubmit}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{
          'nested.key': {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="input"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>,
    );

    fireEvent.change(screen.getByTestId('input'), {
      target: { value: 'hello' },
    });

    fireEvent.submit(screen.getByText('Submit').closest('form')!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { nested: { key: 'hello' } },
        expect.any(Object),
        expect.anything(),
      );
    });
  });

  it("supports deep flat paths like 'a.b.c'", async () => {
    const onSubmit = vi.fn();

    render(
      <BlueForm
        onSubmit={onSubmit}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{
          'a.b.c': {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="deep"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>,
    );

    fireEvent.change(screen.getByTestId('deep'), {
      target: { value: 'deep-value' },
    });

    fireEvent.submit(screen.getByText('Submit').closest('form')!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { a: { b: { c: 'deep-value' } } },
        expect.any(Object),
        expect.anything(),
      );
    });
  });

  it('merges multiple flat paths into the same nested object', async () => {
    const onSubmit = vi.fn();

    render(
      <BlueForm
        onSubmit={onSubmit}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{
          'user.name': {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="name"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
          'user.age': {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="age"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(Number(e.target.value))}
              />
            ),
          },
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>,
    );

    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByTestId('age'), {
      target: { value: '30' },
    });

    fireEvent.submit(screen.getByText('Submit').closest('form')!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { user: { name: 'John', age: 30 } },
        expect.any(Object),
        expect.anything(),
      );
    });
  });

  it('allows flat path and nested section config to coexist', async () => {
    const onSubmit = vi.fn();

    render(
      <BlueForm
        onSubmit={onSubmit}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{
          profile: {
            type: 'section',
            props: {
              nested: true,
              config: {
                email: {
                  type: 'inline',
                  render: ({ fieldProps }) => (
                    <input
                      data-testid="email"
                      value={fieldProps.value ?? ''}
                      onChange={(e) => fieldProps.onChange?.(e.target.value)}
                    />
                  ),
                },
              },
            },
          },
          'profile.name': {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="name"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>,
    );

    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Alice' },
    });

    fireEvent.submit(screen.getByText('Submit').closest('form')!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { profile: { email: 'a@b.com', name: 'Alice' } },
        expect.any(Object),
        expect.anything(),
      );
    });
  });

  it('handles deep flat paths across multiple nested sections', async () => {
    const onSubmit = vi.fn();

    render(
      <BlueForm
        onSubmit={onSubmit}
        renderRoot={({ children, onSubmit }) => (
          <form onSubmit={onSubmit}>{children}</form>
        )}
        config={{
          settings: {
            type: 'section',
            props: {
              nested: true,
              config: {
                theme: {
                  type: 'section',
                  props: {
                    nested: true,
                    config: {
                      mode: {
                        type: 'inline',
                        render: ({ fieldProps }) => (
                          <input
                            data-testid="mode"
                            value={fieldProps.value ?? ''}
                            onChange={(e) =>
                              fieldProps.onChange?.(e.target.value)
                            }
                          />
                        ),
                      },
                    },
                  },
                },
              },
            },
          },
          'settings.theme.color': {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="color"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>,
    );

    fireEvent.change(screen.getByTestId('mode'), {
      target: { value: 'dark' },
    });
    fireEvent.change(screen.getByTestId('color'), {
      target: { value: 'blue' },
    });

    fireEvent.submit(screen.getByText('Submit').closest('form')!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { settings: { theme: { mode: 'dark', color: 'blue' } } },
        expect.any(Object),
        expect.anything(),
      );
    });
  });
});

describe('BlueForm – section inside array', () => {
  it('nests fields under section key inside an array when nested=true', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          users: {
            type: 'array',
            render: ({ children }) => {
              const { append } = useArrayField();
              // Append một object có data ban đầu để test
              return (
                <div>
                  {children}
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        profile: { name: 'New User' },
                      })
                    }
                  >
                    Add
                  </button>
                </div>
              );
            },
            props: {
              config: {
                profile: {
                  type: 'section',
                  props: {
                    nested: true,
                    config: {
                      name: { type: 'hidden' },
                    },
                  },
                },
              },
            },
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    // Click Add để tạo row
    fireEvent.click(screen.getByText('Add'));
    // Submit form
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        users: [{ profile: { name: 'New User' } }],
      });
    });
  });

  it('keeps fields flat inside an array when section has nested=false', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          items: {
            type: 'array',
            render: ({ children }) => {
              const { append } = useArrayField();
              return (
                <div>
                  {children}
                  <button type="button" onClick={() => append({ sku: 'ABC' })}>
                    Add Item
                  </button>
                </div>
              );
            },
            props: {
              config: {
                metadata: {
                  type: 'section',
                  props: {
                    nested: false,
                    config: {
                      sku: { type: 'hidden' },
                    },
                  },
                },
              },
            },
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        items: [{ sku: 'ABC' }], // Không có key 'metadata' vì nested=false
      });
    });
  });

  it('supports array nested inside a section', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          group: {
            type: 'section',
            props: {
              nested: true,
              config: {
                tags: {
                  type: 'array',
                  render: ({ children }) => {
                    const { append } = useArrayField();
                    return (
                      <div>
                        {children}
                        <button type="button" onClick={() => append('react')}>
                          Add Tag
                        </button>
                      </div>
                    );
                  },
                  // Array đơn giản (primitive)
                  props: {
                    config: {
                      $el: { type: 'hidden' },
                    },
                  },
                },
              },
            },
          },
        }}
        fieldMapping={{ hidden: HiddenField }}
      />,
    );

    fireEvent.click(screen.getByText('Add Tag'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        group: {
          tags: [
            {
              $el: undefined,
            },
          ],
        },
      });
    });
  });
});
