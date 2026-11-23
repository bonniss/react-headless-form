import { withBase } from '@rspress/core/runtime'
import {
  type SimpleIcon,
  siAjv,
  siAntdesign,
  siChakraui,
  siEffect,
  siI18next,
  siMantine,
  siMui,
  siPrimereact,
  siReact,
  siReactbootstrap,
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
const i18n = '/examples/recipes/i18n'

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
  { name: 'React-Bootstrap', href: integration('react-bootstrap'), mark: 'B', color: '#41e0fd', icon: siReactbootstrap },
  { name: 'React Native Web', href: integration('react-native-web'), mark: 'RN', color: '#61dafb', icon: siReact },
]

const schemaLibs: Lib[] = [
  { name: 'Zod', href: schema, mark: 'Z', color: '#3068b7', icon: siZod },
  { name: 'Valibot', href: schema, mark: 'V', color: '#d97706', logo: 'valibot.svg' },
  { name: 'ArkType', href: schema, mark: 'A', color: '#7c3aed', logo: 'arktype.svg' },
  { name: 'Yup', href: schema, mark: 'Y', color: '#16a34a' },
  { name: 'Ajv', href: schema, mark: 'J', color: '#dc2626', icon: siAjv },
  { name: 'Joi', href: schema, mark: 'Jo', color: '#0080ff' },
  { name: 'Effect Schema', href: schema, mark: 'Ef', color: '#18181b', icon: siEffect },
]

const i18nLibs: Lib[] = [
  { name: 'i18next', href: i18n, mark: 'i', color: '#26a69a', icon: siI18next },
  { name: 'react-intl', href: i18n, mark: 'Fj', color: '#6f3c97', logo: 'formatjs.svg' },
  { name: 'Lingui', href: i18n, mark: 'Li', color: '#ef4242', logo: 'lingui.svg' },
  { name: 'Paraglide JS', href: i18n, mark: 'Pg', color: '#e8603c', logo: 'paraglide.png' },
]

function Mark({ lib }: { lib: Lib }) {
  if (lib.icon) {
    return (
      // a white or black brand color follows the theme instead
      <svg viewBox="0 0 24 24" width="22" height="22" fill={/^(FFFFFF|000000)$/i.test(lib.icon.hex) ? 'currentColor' : `#${lib.icon.hex}`}>
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
        <CtaTile href={`${integration('')}#bring-your-own-library`}>Don't see your library? Start here →</CtaTile>
      </div>
      <h3>…and so does any schema library</h3>
      <div className="lib-wall__grid">
        {schemaLibs.map(lib => (
          <Tile key={lib.name} lib={lib} />
        ))}
        <CtaTile href={schema}>Another schema? Plug it in →</CtaTile>
      </div>
      <h3>…and so does any i18n library</h3>
      <div className="lib-wall__grid">
        {i18nLibs.map(lib => (
          <Tile key={lib.name} lib={lib} />
        ))}
        <CtaTile href={i18n}>Another i18n library? Pass its t →</CtaTile>
      </div>
    </section>
  )
}
