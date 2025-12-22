import type { DevTool as DevToolProps } from '@hookform/devtools';
import { DevTool } from '@hookform/devtools';
import { ComponentProps, FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

export interface FormDevToolProps
  extends Omit<NonNullable<ComponentProps<typeof DevToolProps>>, 'control'> {}

const FormDevTool: FunctionComponent<FormDevToolProps> = (props) => {
  const { control } = useFormContext();
  return <DevTool {...props} control={control} />;
};

export default FormDevTool;
