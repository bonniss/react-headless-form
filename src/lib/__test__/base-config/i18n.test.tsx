import { BlueForm } from '@/components';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithBlueFormProvider } from '../_utils/render-form';

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>{children}</form>
);

describe('BlueForm i18n', () => {
  it('translates field label using i18nConfig', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            label: {
              message: 'form.name',
            },
            render: ({ fieldProps }: any) => (
              <span data-testid="label">{fieldProps.label}</span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t: (key) => `t:${key}`,
          enabled: true,
        },
      }
    );

    expect(screen.getByTestId('label').textContent).toBe('t:form.name');
  });

  it('falls back to raw label when i18n is disabled', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            label: 'Raw label',
            render: ({ fieldProps }: any) => (
              <span data-testid="label">{fieldProps.label}</span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t: (key: string) => `t:${key}`,
          enabled: false,
        },
      }
    );

    expect(screen.getByTestId('label').textContent).toBe('Raw label');
  });

  it('supports TranslatableText object with params', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            label: {
              message: 'items.count',
              params: { count: 3 },
            },
            render: ({ fieldProps }: any) => (
              <span data-testid="label">{fieldProps.label}</span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t: (key: string, params?: any) => `${key}:${params?.count}`,
        },
      }
    );

    expect(screen.getByTestId('label').textContent).toBe('items.count:3');
  });

  it('uses fallback when translation returns undefined', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            label: {
              message: 'missing.key',
              fallback: 'Fallback label',
            },
            render: ({ fieldProps }: any) => (
              <span data-testid="label">{fieldProps.label}</span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t: () => undefined,
        },
      }
    );

    expect(screen.getByTestId('label').textContent).toBe('Fallback label');
  });

  it('falls back to message when no translation and no fallback', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            label: {
              message: 'Raw label',
            },
            render: ({ fieldProps }: any) => (
              <span data-testid="label">{fieldProps.label}</span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t: () => undefined,
        },
      }
    );

    expect(screen.getByTestId('label').textContent).toBe('Raw label');
  });

  it('translates description using i18nConfig', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            description: 'field.description',
            render: ({ fieldProps }: any) => (
              <span data-testid="desc">{fieldProps.description}</span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t: (key: string) => `t:${key}`,
        },
      }
    );

    expect(screen.getByTestId('desc').textContent).toBe('t:field.description');
  });

  const t = (key: string, params?: Record<string, any>) => {
    if (!params) return key;
    if ('field' in params && Object.keys(params).length === 1) {
      return `${key}:${params.field}`;
    }
    const [, value] = Object.entries(params).find(([k]) => k !== 'field') ?? [];
    return value != null ? `${key}:${value}` : key;
  };

  it('translates required rule using validationTranslation', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            label: 'Name',
            rules: {
              required: true,
            },
            render: ({ fieldProps }: any) => (
              <span data-testid="rule">
                {String(fieldProps.rules.required)}
              </span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t,
          validationTranslation: {
            required: 'form.rules.required',
          },
        },
      }
    );

    expect(screen.getByTestId('rule').textContent).toBe(
      'form.rules.required:Name'
    );
  });

  it('translates minLength rule using validationTranslation', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            label: 'Name',
            rules: {
              minLength: 3,
            },
            render: ({ fieldProps }: any) => (
              <span data-testid="rule">
                {JSON.stringify(fieldProps.rules.minLength)}
              </span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t,
          validationTranslation: {
            minLength: 'form.rules.minLength',
          },
        },
      }
    );

    expect(screen.getByTestId('rule').textContent).toBe(
      JSON.stringify({
        value: 3,
        message: 'form.rules.minLength:3',
      })
    );
  });

  it('translates maxLength rule using validationTranslation', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: 'inline',
            label: 'Name',
            rules: {
              maxLength: 10,
            },
            render: ({ fieldProps }: any) => (
              <span data-testid="rule">
                {JSON.stringify(fieldProps.rules.maxLength)}
              </span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t,
          validationTranslation: {
            maxLength: 'form.rules.maxLength',
          },
        },
      }
    );

    expect(screen.getByTestId('rule').textContent).toBe(
      JSON.stringify({
        value: 10,
        message: 'form.rules.maxLength:10',
      })
    );
  });

  it('translates min rule using validationTranslation', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          age: {
            type: 'inline',
            label: 'Age',
            rules: {
              min: 18,
            },
            render: ({ fieldProps }: any) => (
              <span data-testid="rule">
                {JSON.stringify(fieldProps.rules.min)}
              </span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t,
          validationTranslation: {
            min: 'form.rules.min',
          },
        },
      }
    );

    expect(screen.getByTestId('rule').textContent).toBe(
      JSON.stringify({
        value: 18,
        message: 'form.rules.min:18',
      })
    );
  });

  it('translates max rule using validationTranslation', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          age: {
            type: 'inline',
            label: 'Age',
            rules: {
              max: 65,
            },
            render: ({ fieldProps }: any) => (
              <span data-testid="rule">
                {JSON.stringify(fieldProps.rules.max)}
              </span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t,
          validationTranslation: {
            max: 'form.rules.max',
          },
        },
      }
    );

    expect(screen.getByTestId('rule').textContent).toBe(
      JSON.stringify({
        value: 65,
        message: 'form.rules.max:65',
      })
    );
  });

  it('translates pattern rule using validationTranslation', () => {
    const pattern = /^[a-z]+$/;

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          username: {
            type: 'inline',
            label: 'Username',
            rules: {
              pattern,
            },
            render: ({ fieldProps }: any) => (
              <span data-testid="rule">
                {JSON.stringify(fieldProps.rules.pattern)}
              </span>
            ),
          },
        }}
      />,
      {
        i18nConfig: {
          t,
          validationTranslation: {
            pattern: 'form.rules.pattern',
          },
        },
      }
    );

    expect(screen.getByTestId('rule').textContent).toBe(
      JSON.stringify({
        value: pattern,
        message: 'form.rules.pattern:Username',
      })
    );
  });
});
