// Writes the library version (root package.json, bumped by release-please)
// into the version dropdown of src/_nav.json, before `dev` / `build`.
// _nav.json stays the nav source: declaring `themeConfig.nav` in
// rspress.config.ts would turn off the generated sidebar.
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(readFileSync(path.join(here, '../../package.json'), 'utf8'))
const navPath = path.join(here, '../src/_nav.json')
const nav = JSON.parse(readFileSync(navPath, 'utf8'))

// The version entry is the dropdown that links to the npm page.
const entry = nav.find((item) => item.items?.some((sub) => sub.link?.includes('npmjs.com')))
if (!entry) throw new Error('sync-version: version dropdown not found in src/_nav.json')

const text = `v${version}`
if (entry.text !== text) {
  entry.text = text
  writeFileSync(navPath, `${JSON.stringify(nav, null, 2)}\n`)
  console.log(`[sync-version] nav version → ${text}`)
}
