import { renderWithBlueFormProvider } from '@/__test__/_utils/render-form';
import BlueForm from '@/components/form/BlueForm';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DummyField } from '../_utils/field';

describe('BlueForm base config override', () => {
  it('throws error when renderRoot is not provided', () => {
    expect(() => render(<BlueForm config={{}} />)).toThrowError(/renderRoot/i);
  });

  it('use renderRoot from provider when not provided by form', () => {
    renderWithBlueFormProvider(<BlueForm config={{}} />);
    expect(screen.getByTestId('provider-root')).toBeDefined();
  });

  it('use renderRoot form props over provider', () => {
    renderWithBlueFormProvider(
      <BlueForm
        config={{}}
        renderRoot={(props) => (
          <form data-testid="form-root">{props.children}</form>
        )}
      />
    );
    expect(screen.getByTestId('form-root')).toBeDefined();
  });

  it('uses fieldMapping from provider when not provided by form', () => {
    const ProviderText = () => <DummyField name="provider-text" />;

    renderWithBlueFormProvider(
      <BlueForm
        config={{
          name: { type: 'text' },
        }}
      />,
      {
        fieldMapping: {
          text: ProviderText,
        },
      }
    );

    expect(screen.queryByTestId('provider-text')).toBeDefined();
  });

  it('uses fieldMapping from form props over provider', () => {
    const ProviderText = () => <DummyField name="provider-text" />;
    const FormText = () => <DummyField name="form-text" />;

    renderWithBlueFormProvider(
      <BlueForm
        config={{
          name: { type: 'text' },
        }}
        fieldMapping={{
          text: FormText,
        }}
      />,
      {
        fieldMapping: {
          text: ProviderText,
        },
      }
    );

    expect(screen.getByTestId('form-text')).toBeDefined();
    expect(screen.queryByTestId('provider-text')).toBeFalsy();
  });

  it('uses i18nConfig from form over provider', () => {
    renderWithBlueFormProvider(
      <BlueForm
        i18nConfig={{
          t: (k) => `form:${k}`,
        }}
        config={{
          name: {
            type: 'inline',
            label: 'Name',
            render: ({ fieldProps }) => (
              <div data-testid="label">{fieldProps.label}</div>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t: (k) => `provider:${k}`,
        },
      }
    );

    expect(screen.getByTestId('label').textContent).toBe('form:Name');
  });

  it('falls back to provider i18nConfig', () => {
    renderWithBlueFormProvider(
      <BlueForm
        config={{
          name: {
            type: 'inline',
            label: 'Name',
            render: ({ fieldProps }) => (
              <div data-testid="label">{fieldProps.label}</div>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t: (k) => `provider:${k}`,
        },
      }
    );

    expect(screen.getByTestId('label').textContent).toBe('provider:Name');
  });

  it('uses readOnlyEmptyFallback from form over provider', () => {
    renderWithBlueFormProvider(
      <BlueForm
        readOnly
        readOnlyEmptyFallback={<span data-testid="form-fallback">FORM</span>}
        config={{
          name: {
            type: 'inline',
            render: ({ fieldProps }) => fieldProps.readOnlyEmptyFallback,
          },
        }}
      />,
      {
        readOnlyEmptyFallback: (
          <span data-testid="provider-fallback">PROVIDER</span>
        ),
      }
    );

    expect(screen.getByTestId('form-fallback')).toBeDefined();
    expect(screen.queryByTestId('provider-fallback')).toBeNull();
  });

  it('falls back to provider readOnlyEmptyFallback', () => {
    renderWithBlueFormProvider(
      <BlueForm
        readOnly
        config={{
          name: {
            type: 'inline',
            render: ({ fieldProps }) => fieldProps.readOnlyEmptyFallback,
          },
        }}
      />,
      {
        readOnlyEmptyFallback: (
          <span data-testid="provider-fallback">PROVIDER</span>
        ),
      }
    );

    expect(screen.getByTestId('provider-fallback')).toBeDefined();
  });
});
