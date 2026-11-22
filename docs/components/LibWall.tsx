import { withBase } from '@rspress/core/runtime'
import {
  type SimpleIcon,
  siAjv,
  siAntdesign,
  siChakraui,
  siMantine,
  siMui,
  siPrimereact,
  siReact,
  siShadcnui,
  siZod,
} from 'simple-icons'

/** `icon`: the brand logo (Simple Icons, CC0) when it exists, else the `mark` letters. */
type Lib = { name: string; href: string; mark: string; color: string; icon?: SimpleIcon }

const integration = (slug: string) => `/examples/recipes/integrations/${slug}`
const schema = '/examples/foundational/schema-form'

/** Libraries with a live, self-hosted example. Add one line to add a tile. */
const uiLibs: Lib[] = [
  { name: 'Mantine', href: integration('mantine'), mark: 'Ma', color: '#228be6', icon: siMantine },
  { name: 'shadcn/ui', href: integration('shadcn'), mark: 'sh', color: '#18181b', icon: siShadcnui },
  { name: 'Ant Design', href: integration('antd'), mark: 'An', color: '#1677ff', icon: siAntdesign },
  { name: 'Material UI', href: integration('mui'), mark: 'MU', color: '#007fff', icon: siMui },
  { name: 'Chakra UI', href: integration('chakra-ui'), mark: 'Ch', color: '#319795', icon: siChakraui },
  { name: 'PrimeReact', href: integration('prime-react'), mark: 'Pr', color: '#3b82f6', icon: siPrimereact },
  { name: 'Arco Design', href: integration('arco-design'), mark: 'Ar', color: '#165dff' },
  { name: 'Semi Design', href: integration('semi-design'), mark: 'Se', color: '#0064fa' },
  { name: 'TDesign', href: integration('tdesign'), mark: 'TD', color: '#0052d9' },
  { name: 'animal-island-ui', href: integration('animal-island'), mark: 'ai', color: '#e8a33d' },
  { name: 'React Native Web', href: integration('react-native-web'), mark: 'RN', color: '#61dafb', icon: siReact },
]

const schemaLibs: Lib[] = [
  { name: 'Zod', href: schema, mark: 'Z', color: '#3068b7', icon: siZod },
  { name: 'Valibot', href: schema, mark: 'V', color: '#d97706' },
  { name: 'ArkType', href: schema, mark: 'A', color: '#7c3aed' },
  { name: 'Yup', href: schema, mark: 'Y', color: '#16a34a' },
  { name: 'Ajv', href: schema, mark: 'J', color: '#dc2626', icon: siAjv },
]

/** Dark letters on light brand colors, white on the others. */
const onColor = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map(i => Number.parseInt(hex.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '#111' : '#fff'
}

function Tile({ lib, own = false }: { lib: Lib; own?: boolean }) {
  const color = lib.icon ? lib.icon.hex : lib.color.replace('#', '')
  return (
    <a className={own ? 'lib-wall__tile lib-wall__tile--own' : 'lib-wall__tile'} href={withBase(lib.href)}>
      <span
        className="lib-wall__mark"
        style={own ? undefined : { background: `#${color}`, color: onColor(color) }}
        aria-hidden
      >
        {lib.icon ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d={lib.icon.path} />
          </svg>
        ) : (
          lib.mark
        )}
      </span>
      <span className="lib-wall__name">{lib.name}</span>
    </a>
  )
}

/** Home page wall: every tile opens that library's live example. */
export default function LibWall() {
  return (
    <section className="lib-wall">
      <h2>Works with any UI library</h2>
      <div className="lib-wall__grid">
        {uiLibs.map(lib => (
          <Tile key={lib.name} lib={lib} />
        ))}
        <Tile own lib={{ name: 'Your own', href: `${integration('')}#bring-your-own-library`, mark: '+', color: '' }} />
      </div>
      <h3>…and any schema library</h3>
      <div className="lib-wall__grid lib-wall__grid--small">
        {schemaLibs.map(lib => (
          <Tile key={lib.name} lib={lib} />
        ))}
        <Tile own lib={{ name: 'Any other', href: schema, mark: '+', color: '' }} />
      </div>
    </section>
  )
}
