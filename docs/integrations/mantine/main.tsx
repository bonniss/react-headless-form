import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { mountDemo } from '../shared/mount'
import { demo } from './config'
import { shells } from './fields'

mountDemo(demo, shells, { Wrapper: MantineProvider })
