import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { mountDemo } from '../shared/mount'
import { fields, shells } from './fields'

mountDemo(fields, shells, { Wrapper: MantineProvider })
