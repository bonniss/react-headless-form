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

/**
 * The tile shows, in order: `icon` (Simple Icons, CC0), `logo` (an official file in
 * public/logos, from the library's repository), or the `mark` letters in `color`.
 */
type Lib = { name: string; href: string; mark: string; color: string; icon?: SimpleIcon; logo?: string }

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
  { name: 'Arco Design', href: integration('arco-design'), mark: 'Ar', color: '#165dff', logo: 'arco.svg' },
  { name: 'Semi Design', href: integration('semi-design'), mark: 'Se', color: '#0064fa', logo: 'semi.svg' },
  { name: 'TDesign', href: integration('tdesign'), mark: 'TD', color: '#0052d9', logo: 'tdesign.svg' },
  { name: 'animal-island-ui', href: integration('animal-island'), mark: 'ai', color: '#e8a33d', logo: 'animal-island.png' },
  { name: 'React Native Web', href: integration('react-native-web'), mark: 'RN', color: '#61dafb', icon: siReact },
]

const schemaLibs: Lib[] = [
  { name: 'Zod', href: schema, mark: 'Z', color: '#3068b7', icon: siZod },
  { name: 'Valibot', href: schema, mark: 'V', color: '#d97706', logo: 'valibot.svg' },
  { name: 'ArkType', href: schema, mark: 'A', color: '#7c3aed', logo: 'arktype.svg' },
  { name: 'Yup', href: schema, mark: 'Y', color: '#16a34a' },
  { name: 'Ajv', href: schema, mark: 'J', color: '#dc2626', icon: siAjv },
]

function Mark({ lib }: { lib: Lib }) {
  if (lib.icon) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill={`#${lib.icon.hex}`}>
        <path d={lib.icon.path} />
      </svg>
    )
  }
  if (lib.logo) return <img src={withBase(`/logos/${lib.logo}`)} alt="" width={24} height={24} />
  return <span style={{ color: lib.color }}>{lib.mark}</span>
}

function Tile({ lib }: { lib: Lib }) {
  return (
    <a className="lib-wall__tile" href={withBase(lib.href)}>
      <span className="lib-wall__mark" aria-hidden>
        <Mark lib={lib} />
      </span>
      <span className="lib-wall__name">{lib.name}</span>
    </a>
  )
}

/** The last tile of a group: an invitation, not a library (text only). */
function CtaTile({ href, children }: { href: string; children: string }) {
  return (
    <a className="lib-wall__tile lib-wall__tile--cta" href={withBase(href)}>
      {children}
    </a>
  )
}

/** Home page wall: every tile opens that library's live example. */
export default function LibWall() {
  return (
    <section className="lib-wall">
      <h2>Headless, so any UI library just works</h2>
      <div className="lib-wall__grid">
        {uiLibs.map(lib => (
          <Tile key={lib.name} lib={lib} />
        ))}
        <CtaTile href={`${integration('')}#bring-your-own-library`}>Another UI kit? Wire it up in 3 steps →</CtaTile>
      </div>
      <h3>…and so does any schema library</h3>
      <div className="lib-wall__grid lib-wall__grid--small">
        {schemaLibs.map(lib => (
          <Tile key={lib.name} lib={lib} />
        ))}
        <CtaTile href={schema}>Another schema? Plug it in →</CtaTile>
      </div>
    </section>
  )
}
