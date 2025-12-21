import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlueForm } from '@/components';
import { renderWithBlueFormProvider } from '../_utils/render-form';

const TestRoot = ({ children }: any) => <form>{children}</form>;

describe('BlueForm - conditional UI', () => {
  it('passes visible=false to fieldProps when visible is false', async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            visible: false,
            render: ({ fieldProps }) => (
              <div data-testid="visible">{String(fieldProps.visible)}</div>
            ),
          },
        }}
      />
    );

    expect(screen.getByTestId('visible').textContent).toBe('false');
  });

  it('re-evaluates visible function when form values change', async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          toggle: {
            type: 'inline',
            render: ({ fieldProps: { onChange } }) => (
              <button onClick={() => onChange?.(true)}>Toggle</button>
            ),
          },
          name: {
            type: 'inline',
            visible: (values) => values.toggle === true,
            render: ({ fieldProps }) => (
              <div data-testid="visible">{String(fieldProps.visible)}</div>
            ),
          },
        }}
      />
    );

    expect(screen.getByTestId('visible').textContent).toBe('false');

    fireEvent.click(screen.getByText('Toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('visible').textContent).toBe('true');
    });
  });

  it('passes disabled flag to fieldProps', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            disabled: true,
            render: ({ fieldProps }) => (
              <div data-testid="disabled">{String(fieldProps.disabled)}</div>
            ),
          },
        }}
      />
    );

    expect(screen.getByTestId('disabled').textContent).toBe('true');
  });
});
