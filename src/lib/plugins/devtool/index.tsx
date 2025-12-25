import { BlueFormPlugin } from '@/types/plugin';
import FormDevTool, { FormDevToolProps } from './FormDevTool';

export const devToolPlugin = (pluginProps?: FormDevToolProps): BlueFormPlugin => {
  return {
    name: 'devtool',
    render: () => <FormDevTool {...pluginProps} />,
  };
}
