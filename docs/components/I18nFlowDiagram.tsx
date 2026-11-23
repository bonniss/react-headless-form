import type { ReactNode } from 'react'

/**
 * i18n guide diagrams. Colors come from the docs theme variables (light and
 * dark); the SVGs keep a minimum width and scroll inside their frame on phones
 * (`.i18n-diagram` in theme/index.css).
 */
const c = {
  text: 'var(--rp-c-text-1)',
  muted: 'var(--rp-c-text-2)',
  brand: 'var(--rp-c-brand)',
  soft: 'var(--rp-c-bg-soft)',
  error: '#dc2626',
}
const mono = 'var(--rp-font-family-mono, monospace)'

type Tone = 'yours' | 'lib' | 'source'

/** A box with a title and monospace lines. Dashed: what you write. */
function Box({
  x,
  y,
  w,
  h,
  title,
  lines = [],
  tone = 'yours',
  size = 12,
}: {
  x: number
  y: number
  w: number
  h: number
  title: string
  lines?: string[]
  tone?: Tone
  size?: number
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="12"
        fill={tone === 'yours' ? 'none' : c.soft}
        stroke={tone === 'lib' ? c.brand : c.muted}
        strokeWidth={tone === 'lib' ? 2.5 : 1.5}
        strokeDasharray={tone === 'yours' ? '6 4' : undefined}
      />
      <text x={x + 14} y={y + 22} fontSize="13" fontWeight="700" fill={tone === 'lib' ? c.brand : c.text}>
        {title}
      </text>
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + 14}
          y={y + 42 + i * (size + 5)}
          fontSize={size}
          fill={c.muted}
          fontFamily={mono}
          xmlSpace="preserve"
        >
          {line}
        </text>
      ))}
    </g>
  )
}

function Arrow({ d }: { d: string }) {
  return <path d={d} fill="none" stroke={c.muted} strokeWidth="1.5" markerEnd="url(#i18n-arrow)" />
}

function Diagram({
  width,
  height,
  label,
  caption,
  children,
}: {
  width: number
  height: number
  label: string
  caption: ReactNode
  children: ReactNode
}) {
  return (
    <figure className="i18n-diagram">
      <div className="i18n-diagram__scroll">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
          <defs>
            <marker
              id="i18n-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill={c.muted} />
            </marker>
          </defs>
          {children}
        </svg>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

/** Main diagram: keys in, BlueForm calls t, your component renders the strings. */
export default function I18nFlowDiagram() {
  return (
    <Diagram
      width={880}
      height={350}
      label="Your config holds keys; i18nConfig holds t, which reads your messages; BlueForm translates; your component reads the strings from useField() and props and renders what the user sees"
      caption={
        <>
          Dashed: what you write. Only BlueForm calls <code>t</code>; your component gets finished strings from{' '}
          <code>useField()</code> and its props. A new <code>t</code> (the language changed): BlueForm translates
          again, the values are kept.
        </>
      }
    >
      <Box
        x={20}
        y={20}
        w={260}
        h={136}
        title="config (keys)"
        lines={['label: "email.label"', 'description: "email.desc"', 'props.placeholder: "email.hint"', 'rules: { required: true }']}
      />

      <rect x="300" y="20" width="560" height="136" rx="12" fill="none" stroke={c.muted} strokeWidth="1.5" strokeDasharray="6 4" />
      <text x="314" y="42" fontSize="13" fontWeight="700" fill={c.text}>
        i18nConfig
      </text>
      {['t(key, params)', 'validationTranslation: {', '  required: "validation.required"', '}'].map((line, i) => (
        <text key={line} x="314" y={62 + i * 17} fontSize="12" fill={c.muted} fontFamily={mono} xmlSpace="preserve">
          {line}
        </text>
      ))}
      <Box
        x={580}
        y={30}
        w={268}
        h={116}
        tone="source"
        size={11}
        title="messages (any source)"
        lines={[
          '"email.label": "Email"',
          '"email.desc": "We never share it"',
          '"email.hint": "you@company.com"',
          '"validation.required":',
          '  "{field} is required"',
        ]}
      />

      <rect x="200" y="226" width="180" height="76" rx="14" fill={c.soft} stroke={c.brand} strokeWidth="2.5" />
      <text x="290" y="262" textAnchor="middle" fontSize="22" fontWeight="700" fill={c.brand}>
        BlueForm
      </text>
      <text x="290" y="284" textAnchor="middle" fontSize="11" fill={c.muted}>
        calls t
      </text>
      <Arrow d="M150 156 L262 222" />
      <Arrow d="M420 156 L322 222" />

      <Box x={430} y={226} w={190} h={76} title="your component" lines={['useField()', '+ props']} />
      <Arrow d="M382 264 L426 264" />

      <Arrow d="M622 264 L666 264" />
      <text x="680" y="226" fontSize="13" fontWeight="600" fill={c.text}>
        Email *
      </text>
      <rect x="680" y="236" width="180" height="32" rx="6" fill="none" stroke={c.error} strokeWidth="1.5" />
      <text x="692" y="257" fontSize="12" fill={c.muted} opacity="0.7">
        you@company.com
      </text>
      <text x="680" y="288" fontSize="12" fill={c.muted}>
        We never share it
      </text>
      <text x="680" y="308" fontSize="12" fill={c.error}>
        Email is required
      </text>
      <text x="770" y="336" textAnchor="middle" fontSize="11" fill={c.muted}>
        what the user sees
      </text>
    </Diagram>
  )
}

/** validationTranslation: a rule plus its message key becomes the rule's message, with params. */
export function I18nValidationDiagram() {
  return (
    <Diagram
      width={880}
      height={330}
      label="The field's rules and validationTranslation give BlueForm a key per rule; BlueForm calls t with the translated label and the rule value as params; the result is the rule's message, which React Hook Form reports as errorMessage"
      caption={
        <>
          <code>{'{field}'}</code> is the translated label and the rule value is a param. The message replaces the
          field's own message for that rule. Other errors (schema, <code>setError()</code>, <code>validate</code>) are
          translated when they are shown, without params.
        </>
      }
    >
      <Box x={20} y={16} w={330} h={76} title="field config" lines={['label: "email.label"', 'rules: { required: true, minLength: 3 }']} />
      <Box
        x={380}
        y={16}
        w={330}
        h={76}
        title="validationTranslation"
        lines={['required: "validation.required"', 'minLength: "validation.minLength"']}
      />

      <Box
        x={60}
        y={130}
        w={760}
        h={92}
        tone="lib"
        title="BlueForm, for each rule in validationTranslation"
        lines={[
          't("validation.required",  { field: "Email" })               → "Email is required"',
          't("validation.minLength", { field: "Email", minLength: 3 })  → "Email: at least 3 characters"',
        ]}
      />
      <Arrow d="M185 92 L300 126" />
      <Arrow d="M545 92 L470 126" />

      <Box
        x={60}
        y={258}
        w={470}
        h={56}
        tone="source"
        title="rules handed to React Hook Form"
        lines={['required: { value: true, message: "Email is required" }']}
      />
      <Arrow d="M295 222 L295 254" />
      <Arrow d="M532 286 L600 286" />
      <text x="612" y="282" fontSize="12" fill={c.muted} fontFamily={mono}>
        errorMessage
      </text>
      <text x="612" y="300" fontSize="12" fill={c.error}>
        Email is required
      </text>
    </Diagram>
  )
}
