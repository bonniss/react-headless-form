// Post-processes rspress' LLM outputs (llms.txt, llms-full.txt, per-page .md):
// - orders pages like the sidebar (_nav.json + _meta.json); rspress only does
//   this for an explicit themeConfig.sidebar, otherwise order is alphabetical
// - turns site-relative links into absolute URLs
// - strips shiki notation comments such as `// [!code focus]`
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const outDir = path.join(root, 'doc_build')
const base = '/react-headless-form/'
const origin = 'https://bonniss.github.io'

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
const isPage = (name) => /\.mdx?$/.test(name)

/** Page paths (relative to src, without extension) in sidebar order. */
function orderDir(rel) {
  const dir = path.join(srcDir, rel)
  const metaFile = path.join(dir, '_meta.json')
  const join = (name) => (rel ? `${rel}/${name}` : name)
  const entries = readdirSync(dir)

  let names
  if (existsSync(metaFile)) {
    names = readJson(metaFile).map((item) => (typeof item === 'string' ? item : item.name))
  } else {
    names = entries
      .filter((e) => !e.startsWith('_'))
      .map((e) => e.replace(/\.mdx?$/, ''))
      .sort((a, b) => (a === 'index' ? -1 : b === 'index' ? 1 : a.localeCompare(b)))
  }

  const result = []
  // a directory's own index page comes first
  if (!names.includes('index') && entries.some((e) => /^index\.mdx?$/.test(e))) {
    result.push(join('index'))
  }
  for (const name of [...new Set(names)]) {
    const full = path.join(dir, name)
    if (existsSync(full) && statSync(full).isDirectory()) {
      result.push(...orderDir(join(name)))
    } else if (entries.some((e) => isPage(e) && e.replace(/\.mdx?$/, '') === name)) {
      result.push(join(name))
    }
  }
  return result
}

const navOrder = readJson(path.join(srcDir, '_nav.json'))
  .map((item) => item.link.split('/').filter(Boolean)[0])
  .filter((top, i, all) => all.indexOf(top) === i)
const order = navOrder.flatMap((top) => orderDir(top)).map((p) => `${base}${p}.md`)
const rank = (mdUrl) => {
  const i = order.indexOf(mdUrl)
  return i === -1 ? Number.MAX_SAFE_INTEGER : i
}

const absolutize = (text) =>
  text.replace(/\]\((\/react-headless-form\/[^)]*)\)/g, (_, url) => `](${origin}${url})`)
const stripNotation = (text) => text.replace(/[ \t]*(\/\/|#|<!--)\s*\[!code [^\]]+\](\s*-->)?/g, '')

// llms.txt: sort the bullet list inside every "## Section"
{
  const file = path.join(outDir, 'llms.txt')
  const blocks = readFileSync(file, 'utf8').split(/\n(?=## )/)
  const sorted = blocks.map((block) => {
    const lines = block.split('\n')
    const items = lines.filter((l) => l.startsWith('- ['))
    if (!items.length) return block
    const urlOf = (l) => l.match(/\]\(([^)]+)\)/)?.[1] ?? ''
    items.sort((a, b) => rank(urlOf(a)) - rank(urlOf(b)))
    let i = 0
    return lines.map((l) => (l.startsWith('- [') ? items[i++] : l)).join('\n')
  })
  writeFileSync(file, absolutize(sorted.join('\n')))
}

// llms-full.txt: sort page chunks
{
  const file = path.join(outDir, 'llms-full.txt')
  const text = readFileSync(file, 'utf8')
  const chunks = text.split(/(?=^---\nurl: )/m).filter((c) => c.trim())
  const urlOf = (c) => c.match(/^---\nurl: (.+)\n/)?.[1] ?? ''
  chunks.sort((a, b) => rank(urlOf(a)) - rank(urlOf(b)))
  const out = absolutize(stripNotation(chunks.join(''))).replace(/^url: \//gm, `url: ${origin}/`)
  writeFileSync(file, out)
}

// per-page .md files
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full)
    else if (entry.endsWith('.md')) writeFileSync(full, stripNotation(readFileSync(full, 'utf8')))
  }
}
walk(outDir)

console.log(`[postbuild-llms] ordered ${order.length} pages`)
