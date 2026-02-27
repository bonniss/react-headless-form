/**
 * Tests for conditional watch() optimization in BlueFormEngine
 *
 * Before this change: BlueFormEngine always called watch() (global form subscription),
 * causing the entire engine to re-render on every keystroke regardless of whether
 * any field actually uses conditional visible/disabled logic.
 *
 * After this change: watch() is only called when at least one field in the config
 * uses visible or disabled as a function. Static-only forms skip the subscription
 * entirely.
 *
 * Test strategy:
 *   - Behavior tests: conditional visible/disabled must still work correctly
 *   - Subscription tests: engine must NOT re-render on form changes when no
 *     conditional fields exist (verified via render count spy)
 */
import { useField } from '@/components';
import BlueForm from '@/components/form/BlueForm';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

// ---------------------------------------------------------------------------
// Behavior: conditional visible
// ---------------------------------------------------------------------------

describe('conditional watch — visible behavior', () => {
  it('shows field when visible() returns true', async () => {
    render(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          type: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <select
                data-testid="type"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              >
                <option value="">-</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            ),
          },
          detail: {
            type: 'inline',
            visible: (values: any) => values.type === 'B',
            // Field component is responsible for hiding itself based on fieldProps.visible.
            // The engine passes visible down as a resolved prop — it does not skip rendering.
            render: ({ fieldProps }) =>
              fieldProps.visible ? <div data-testid="detail" /> : null,
          },
        }}
      />,
    );

    expect(screen.queryByTestId('detail')).toBeNull();

    fireEvent.change(screen.getByTestId('type'), { target: { value: 'B' } });

    await waitFor(() => {
      expect(screen.getByTestId('detail')).toBeDefined();
    });
  });

  it('hides field when visible() returns false', async () => {
    render(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          toggle: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="toggle"
                type="checkbox"
                checked={Boolean(fieldProps.value)}
                onChange={(e) => fieldProps.onChange?.(e.target.checked)}
              />
            ),
          },
          secret: {
            type: 'inline',
            visible: (values: any) => Boolean(values.toggle),
            render: ({ fieldProps }) =>
              fieldProps.visible ? <div data-testid="secret" /> : null,
          },
        }}
      />,
    );

    // Initially hidden
    expect(screen.queryByTestId('secret')).toBeNull();

    // Show
    fireEvent.click(screen.getByTestId('toggle'));
    await waitFor(() => expect(screen.getByTestId('secret')).toBeDefined());

    // Hide again
    fireEvent.click(screen.getByTestId('toggle'));
    await waitFor(() => expect(screen.queryByTestId('secret')).toBeNull());
  });

  it('evaluates visible() with the current full form values snapshot', async () => {
    render(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          a: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="a"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
          b: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="b"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
          result: {
            type: 'inline',
            // depends on both a and b
            visible: (values: any) => values.a === 'x' && values.b === 'y',
            render: ({ fieldProps }) =>
              fieldProps.visible ? <div data-testid="result" /> : null,
          },
        }}
      />,
    );

    expect(screen.queryByTestId('result')).toBeNull();

    fireEvent.change(screen.getByTestId('a'), { target: { value: 'x' } });
    await waitFor(() => expect(screen.queryByTestId('result')).toBeNull()); // b not set yet

    fireEvent.change(screen.getByTestId('b'), { target: { value: 'y' } });
    await waitFor(() => expect(screen.getByTestId('result')).toBeDefined());
  });
});

// ---------------------------------------------------------------------------
// Behavior: conditional disabled
// ---------------------------------------------------------------------------

describe('conditional watch — disabled behavior', () => {
  it('disables field when disabled() returns true', async () => {
    render(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{
          text: () => {
            const { fieldProps } = useField();
            return (
              <input
                data-testid="target"
                disabled={fieldProps.disabled}
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            );
          },
        }}
        config={{
          lock: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="lock"
                type="checkbox"
                checked={Boolean(fieldProps.value)}
                onChange={(e) => fieldProps.onChange?.(e.target.checked)}
              />
            ),
          },
          name: {
            type: 'text',
            disabled: (values: any) => Boolean(values.lock),
          },
        }}
      />,
    );

    const input = screen.getByTestId('target') as HTMLInputElement;
    expect(input.disabled).toBe(false);

    fireEvent.click(screen.getByTestId('lock'));

    await waitFor(() => {
      expect((screen.getByTestId('target') as HTMLInputElement).disabled).toBe(
        true,
      );
    });
  });
});

// ---------------------------------------------------------------------------
// Subscription: no watch() re-renders for static-only forms
// ---------------------------------------------------------------------------

describe('conditional watch — subscription optimization', () => {
  it('does not re-render engine when no conditional fields exist', async () => {
    // We count how many times the engine's field loop executes by counting
    // how many times a field's render function is called after mount.
    const renderCount = vi.fn();

    render(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          firstName: {
            type: 'inline',
            render: ({ fieldProps }) => {
              renderCount();
              return (
                <input
                  data-testid="firstName"
                  value={fieldProps.value ?? ''}
                  onChange={(e) => fieldProps.onChange?.(e.target.value)}
                />
              );
            },
          },
          lastName: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="lastName"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
        }}
      />,
    );

    // Capture render count after initial mount
    const countAfterMount = renderCount.mock.calls.length;

    // Type into lastName — this changes form state
    fireEvent.change(screen.getByTestId('lastName'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByTestId('lastName'), {
      target: { value: 'Doe2' },
    });
    fireEvent.change(screen.getByTestId('lastName'), {
      target: { value: 'Doe3' },
    });

    // Wait a tick to let any potential re-renders flush
    await waitFor(() => {
      expect(screen.getByTestId('lastName')).toBeDefined();
    });

    // firstName's render should NOT have been called again —
    // engine didn't re-render because watch() was not subscribed.
    // With the bug (always watch): would be countAfterMount + 3 or more.
    expect(renderCount.mock.calls.length).toBe(countAfterMount);
  });

  it('does re-render engine when a conditional field exists and a dependency changes', async () => {
    const renderCount = vi.fn();

    render(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          type: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="type"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
          detail: {
            type: 'inline',
            visible: (values: any) => values.type === 'B',
            render: ({ fieldProps }) => {
              renderCount();
              return fieldProps.visible ? (
                <div data-testid="detail-render" />
              ) : null;
            },
          },
        }}
      />,
    );

    // Engine subscribes because `detail` has a visible() function.
    // Changing `type` triggers engine re-render → detail re-evaluates.
    fireEvent.change(screen.getByTestId('type'), { target: { value: 'B' } });

    await waitFor(() => {
      expect(screen.getByTestId('detail-render')).toBeDefined();
    });

    // detail rendered at least once after the change
    expect(renderCount.mock.calls.length).toBeGreaterThan(0);
  });

  it('nested section: conditional field inside section responds to form changes', async () => {
    // This test verifies that a conditional field inside a nested section engine
    // correctly subscribes and reacts to form value changes — i.e. the optimization
    // (skipping watch() at parent level) does not break child-level conditional logic.
    render(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="name"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
          section: {
            type: 'section',
            props: {
              nested: false,
              config: {
                toggle: {
                  type: 'inline',
                  render: ({ fieldProps }) => (
                    <input
                      data-testid="toggle"
                      type="checkbox"
                      checked={Boolean(fieldProps.value)}
                      onChange={(e) => fieldProps.onChange?.(e.target.checked)}
                    />
                  ),
                },
                conditional: {
                  type: 'inline',
                  visible: (values: any) => Boolean(values.toggle),
                  render: ({ fieldProps }) =>
                    fieldProps.visible ? (
                      <div data-testid="conditional" />
                    ) : null,
                },
              },
            },
          },
        }}
      />,
    );

    // Initially hidden
    expect(screen.queryByTestId('conditional')).toBeNull();

    // Toggle on → conditional appears
    fireEvent.click(screen.getByTestId('toggle'));
    await waitFor(() =>
      expect(screen.getByTestId('conditional')).toBeDefined(),
    );

    // Toggle off → conditional disappears
    fireEvent.click(screen.getByTestId('toggle'));
    await waitFor(() => expect(screen.queryByTestId('conditional')).toBeNull());

    // Typing into an unrelated field (name) does not affect conditional visibility
    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Alice' },
    });
    await waitFor(() => expect(screen.queryByTestId('conditional')).toBeNull());
  });

  it('static boolean visible/disabled fields do not cause subscription', async () => {
    const renderCount = vi.fn();

    render(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          a: {
            type: 'inline',
            visible: true, // boolean, not function
            disabled: false, // boolean, not function
            render: ({ fieldProps }) => {
              renderCount();
              return (
                <input
                  data-testid="a"
                  value={fieldProps.value ?? ''}
                  onChange={(e) => fieldProps.onChange?.(e.target.value)}
                />
              );
            },
          },
          b: {
            type: 'inline',
            render: ({ fieldProps }) => (
              <input
                data-testid="b"
                value={fieldProps.value ?? ''}
                onChange={(e) => fieldProps.onChange?.(e.target.value)}
              />
            ),
          },
        }}
      />,
    );

    const mountCount = renderCount.mock.calls.length;

    fireEvent.change(screen.getByTestId('b'), { target: { value: 'x' } });
    fireEvent.change(screen.getByTestId('b'), { target: { value: 'xy' } });

    await waitFor(() => {
      expect((screen.getByTestId('b') as HTMLInputElement).value).toBe('xy');
    });

    // Field `a` should not have re-rendered — static visible/disabled = no subscription
    expect(renderCount.mock.calls.length).toBe(mountCount);
  });
});
