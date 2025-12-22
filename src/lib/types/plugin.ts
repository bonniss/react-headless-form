import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export type BlueFormPlugin = {
  name: string;
  render?: (form: UseFormReturn<any>) => ReactNode;
};
