import { CssBaseline } from '@mui/material'
import type { ReactNode } from 'react'
import { mountDemo } from '../shared/mount'
import { fields, shells } from './fields'

const Wrapper = ({ children }: { children: ReactNode }) => (
  <>
    <CssBaseline />
    {children}
  </>
)

mountDemo(fields, shells, { Wrapper })
