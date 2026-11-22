import { CssBaseline } from '@mui/material'
import type { ReactNode } from 'react'
import { mountDemo } from '../shared/mount'
import { demo } from './config'
import { shells } from './fields'

const Wrapper = ({ children }: { children: ReactNode }) => (
  <>
    <CssBaseline />
    {children}
  </>
)

mountDemo(demo, shells, { Wrapper })
