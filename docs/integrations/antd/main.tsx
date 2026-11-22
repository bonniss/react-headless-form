import { ConfigProvider } from 'antd'
import type { ReactNode } from 'react'
import { mountDemo } from '../shared/mount'
import { fields, shells } from './fields'

// antd inserts a space between two CJK characters in buttons ("保 存");
// turn it off for Japanese labels.
const Wrapper = ({ children }: { children: ReactNode }) => (
  <ConfigProvider button={{ autoInsertSpace: false }}>{children}</ConfigProvider>
)

mountDemo(fields, shells, { Wrapper })
