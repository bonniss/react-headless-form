import { withBase } from '@rspress/core/runtime'

type Lib = { name: string; href: string; mark: string; color: string }

const integration = (slug: string) => `/examples/recipes/integrations/${slug}`
const schema = '/examples/foundational/schema-form'

/** Libraries with a live, self-hosted example. Add one line to add a tile. */
const uiLibs: Lib[] = [
  { name: 'Mantine', href: integration('mantine'), mark: 'Ma', color: '#228be6' },
  { name: 'shadcn/ui', href: integration('shadcn'), mark: 'sh', color: '#18181b' },
  { name: 'Ant Design', href: integration('antd'), mark: 'An', color: '#1677ff' },
  { name: 'Material UI', href: integration('mui'), mark: 'MU', color: '#007fff' },
  { name: 'Chakra UI', href: integration('chakra-ui'), mark: 'Ch', color: '#319795' },
  { name: 'PrimeReact', href: integration('prime-react'), mark: 'Pr', color: '#3b82f6' },
  { name: 'Arco Design', href: integration('arco-design'), mark: 'Ar', color: '#165dff' },
  { name: 'Semi Design', href: integration('semi-design'), mark: 'Se', color: '#0064fa' },
  { name: 'TDesign', href: integration('tdesign'), mark: 'TD', color: '#0052d9' },
  { name: 'animal-island-ui', href: integration('animal-island'), mark: 'ai', color: '#e8a33d' },
  { name: 'React Native Web', href: integration('react-native-web'), mark: 'RN', color: '#61dafb' },
]

const schemaLibs: Lib[] = [
  { name: 'Zod', href: schema, mark: 'Z', color: '#3068b7' },
  { name: 'Valibot', href: schema, mark: 'V', color: '#d97706' },
  { name: 'ArkType', href: schema, mark: 'A', color: '#7c3aed' },
  { name: 'Yup', href: schema, mark: 'Y', color: '#16a34a' },
  { name: 'Ajv', href: schema, mark: 'J', color: '#dc2626' },
]

function Tile({ lib, own = false }: { lib: Lib; own?: boolean }) {
  return (
    <a className={own ? 'lib-wall__tile lib-wall__tile--own' : 'lib-wall__tile'} href={withBase(lib.href)}>
      <span className="lib-wall__mark" style={own ? undefined : { background: lib.color }}>
        {lib.mark}
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
      <p>The same form, built with each of these. Pick one to see it live, or bring your own components.</p>
      <div className="lib-wall__grid">
        {uiLibs.map(lib => (
          <Tile key={lib.name} lib={lib} />
        ))}
        <Tile own lib={{ name: 'Your own', href: `${integration('')}#bring-your-own-library`, mark: '+', color: '' }} />
      </div>
      <h3>…and any schema library</h3>
      <p>Any Standard Schema through the <code>schema</code> prop; anything else through a resolver.</p>
      <div className="lib-wall__grid lib-wall__grid--small">
        {schemaLibs.map(lib => (
          <Tile key={lib.name} lib={lib} />
        ))}
        <Tile own lib={{ name: 'Any other', href: schema, mark: '+', color: '' }} />
      </div>
    </section>
  )
}
