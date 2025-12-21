import { BlueForm, HiddenField } from '@/components';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithBlueFormProvider } from '../_utils/render-form';

describe('HiddenField – nested object', () => {
  it('registers value using full path instead of local name', async () => {
    let submitted: any = null;

    renderWithBlueFormProvider(
      <BlueForm
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
        onSubmit={(data) => {
          submitted = data;
        }}
      >
        <button type="submit">Submit</button>
      </BlueForm>
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        profile: {
          userId: 'u-123',
        },
      });

      // ensure it is NOT at root
      expect(submitted.userId).toBeUndefined();
    });
  });
});
