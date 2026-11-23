import type { ReactNode } from 'react'

/**
 * Where i18n happens: your config holds keys, BlueForm calls `t`, and the field
 * component receives finished strings. HTML rather than SVG so the text stays
 * readable on a phone (the columns stack). Styles: `.i18n-flow` in theme/index.css.
 */

function Col({ title, sub, tone, children }: { title: string; sub: string; tone: 'yours' | 'lib'; children: ReactNode }) {
  return (
    <section className={`i18n-flow__col i18n-flow__col--${tone}`}>
      <header>
        <strong>{title}</strong>
        <span>{sub}</span>
      </header>
      {children}
    </section>
  )
}

/** One line: what comes in, and (optionally) what it becomes. */
function Row({ from, to, error }: { from: ReactNode; to?: ReactNode; error?: boolean }) {
  return (
    <div className="i18n-flow__row">
      <code>{from}</code>
      {to && (
        <>
          <span className="i18n-flow__to" aria-hidden>
            →
          </span>
          <code className={error ? 'i18n-flow__out i18n-flow__out--error' : 'i18n-flow__out'}>{to}</code>
        </>
      )}
    </div>
  )
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="i18n-flow__step">
      <div className="i18n-flow__step-title">{title}</div>
      {children}
    </div>
  )
}

const Arrow = () => (
  <div className="i18n-flow__arrow" aria-hidden>
    <span>↓</span>
  </div>
)

export default function I18nFlowDiagram() {
  return (
    <figure className="i18n-flow" aria-label="Where translation happens: config holds keys, BlueForm calls t, the field component receives translated strings">
      <div className="i18n-flow__cols">
        <Col title="Your config" sub="keys, no translation" tone="yours">
          <Step title="setupForm, once">
            <Row from={'validationTranslation: { required: "validation.required" }'} />
          </Step>
          <Step title="<Form>, per language">
            <Row from="i18nConfig={{ t }}" />
          </Step>
          <Step title="field config">
            <Row from={'label: "form.email"'} />
            <Row from={'props: { placeholder: "form.email.hint" }'} />
            <Row from="rules: { required: true }" />
          </Step>
        </Col>

        <Arrow />

        <Col title="BlueForm" sub="the only place that calls t" tone="lib">
          <Step title="merge i18nConfig: Form keys win">
            <Row from="{ t, validationTranslation }" />
          </Step>
          <Step title="compile each field (again when t changes)">
            <Row from={'t("form.email")'} to={'"Email"'} />
            <Row from={'t("form.email.hint")'} to={'"you@company.com"'} />
            <Row from={'t("validation.required", { field: "Email" })'} to={'"Email is required"'} />
          </Step>
          <Step title="on display, every error message">
            <Row from="t(error.message)" to="errorMessage" />
          </Step>
        </Col>

        <Arrow />

        <Col title="Your field component" sub="no t, no locale, no i18n library" tone="yours">
          <Step title="useField()">
            <Row from={'label'} to={'"Email"'} />
            <Row from={'errorMessage'} to={'"Email is required"'} error />
          </Step>
          <Step title="props">
            <Row from={'placeholder'} to={'"you@company.com"'} />
          </Step>
          <Step title="renders them as is">
            <Row from={'<label>{label}</label>'} />
          </Step>
        </Col>
      </div>
      <figcaption>
        A new <code>t</code> (the language changed): BlueForm compiles the fields again and validates again the
        fields that show an error, so the component re-renders with the new strings. The values are kept.
      </figcaption>
    </figure>
  )
}

/** Variant B: one field's texts, row by row, from the key to what the component receives. */
const journey: { what: string; config: string; call: string; when: string; gets: string; error?: boolean }[] = [
  { what: 'label', config: '"form.email"', call: 't("form.email")', when: 'compile', gets: 'label: "Email"' },
  { what: 'description', config: '"form.email.desc"', call: 't("form.email.desc")', when: 'compile', gets: 'description: "Never shared"' },
  { what: 'placeholder', config: 'props: { placeholder: "form.email.hint" }', call: 't("form.email.hint")', when: 'compile', gets: 'placeholder: "you@company.com"' },
  {
    what: 'rule message',
    config: 'rules: { required: true } + validationTranslation',
    call: 't("validation.required", { field: "Email" })',
    when: 'compile',
    gets: 'errorMessage: "Email is required"',
    error: true,
  },
  {
    what: 'other errors',
    config: 'setError("email", { message: "errors.email.taken" }), schema, validate',
    call: 't("errors.email.taken")',
    when: 'display',
    gets: 'errorMessage: "Already taken"',
    error: true,
  },
]

export function I18nFieldJourney() {
  return (
    <figure className="i18n-journey" aria-label="One field's texts: the key in your config, the t call BlueForm makes, the string your component receives">
      <div className="i18n-journey__head" aria-hidden>
        <span />
        <span>Your config: a key</span>
        <span>BlueForm calls t</span>
        <span>Your component receives</span>
      </div>
      {journey.map(row => (
        <div className="i18n-journey__row" key={row.what}>
          <strong>{row.what}</strong>
          <div data-label="Your config">
            <code>{row.config}</code>
          </div>
          <div data-label="BlueForm calls t">
            <code className="i18n-flow__out">{row.call}</code>
            <span className={`i18n-journey__when i18n-journey__when--${row.when}`}>
              {row.when === 'compile' ? 'once per field, again when t changes' : 'each time it is shown'}
            </span>
          </div>
          <div data-label="Your component receives">
            <code className={row.error ? 'i18n-flow__out i18n-flow__out--error' : 'i18n-flow__out'}>{row.gets}</code>
          </div>
        </div>
      ))}
      <figcaption>
        Each text is a key until BlueForm calls <code>t</code>; the component only ever sees the right-hand column.
      </figcaption>
    </figure>
  )
}

/* Variant C: the sketch, as a graph. Colors from the docs theme (light and dark). */
const c = {
  text: 'var(--rp-c-text-1)',
  muted: 'var(--rp-c-text-2)',
  brand: 'var(--rp-c-brand)',
  soft: 'var(--rp-c-bg-soft)',
  line: 'var(--rp-c-divider)',
  error: '#dc2626',
}
const mono = 'var(--rp-font-family-mono, monospace)'

function Box({ x, y, w, h, title, lines, tone = 'yours' }: { x: number; y: number; w: number; h: number; title: string; lines: string[]; tone?: 'yours' | 'source' }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="12"
        fill={tone === 'source' ? c.soft : 'none'}
        stroke={c.muted}
        strokeWidth="1.5"
        strokeDasharray={tone === 'yours' ? '6 4' : undefined}
      />
      <text x={x + 14} y={y + 22} fontSize="13" fontWeight="700" fill={c.text}>
        {title}
      </text>
      {lines.map((line, i) => (
        <text key={line} x={x + 14} y={y + 42 + i * 17} fontSize="12" fill={c.muted} fontFamily={mono}>
          {line}
        </text>
      ))}
    </g>
  )
}

function Edge({ d, label, lx, ly, anchor = 'middle' }: { d: string; label?: string; lx?: number; ly?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <g>
      <path d={d} fill="none" stroke={c.muted} strokeWidth="1.5" markerEnd="url(#i18n-sketch-arrow)" />
      {label && (
        <text x={lx} y={ly} fontSize="11" fill={c.muted} textAnchor={anchor}>
          {label}
        </text>
      )}
    </g>
  )
}

export function I18nSketchDiagram() {
  return (
    <figure className="i18n-sketch">
      <div className="i18n-sketch__scroll">
        <svg
          viewBox="0 0 800 440"
          role="img"
          aria-label="Config keys and i18nConfig (t, validationTranslation, reading your message sources) go into BlueForm; your field component reads useField(); the rendered field shows translated label, description and error"
        >
          <defs>
            <marker id="i18n-sketch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill={c.muted} />
            </marker>
          </defs>

          {/* message sources */}
          <Box
            x={480}
            y={8}
            w={310}
            h={126}
            tone="source"
            title="messages (JSON, a switch, a library)"
            lines={['"email.label": "Email"', '"email.desc": "May this message find u"', '"validation.required":', '  "{field} is required"']}
          />

          {/* config */}
          <Box
            x={20}
            y={150}
            w={250}
            h={96}
            title="config (keys)"
            lines={['label: "email.label"', 'description: "email.desc"', 'rules: { required: true }']}
          />

          {/* i18nConfig */}
          <Box
            x={300}
            y={150}
            w={300}
            h={96}
            title="i18nConfig"
            lines={['t(key, params)', 'validationTranslation:', '  { required: "validation.required" }']}
          />
          <Edge d="M630 134 L590 148" label="t reads" lx={618} ly={150} anchor="start" />

          {/* BlueForm */}
          <rect x="300" y="300" width="200" height="76" rx="14" fill={c.soft} stroke={c.brand} strokeWidth="2.5" />
          <text x="400" y="336" textAnchor="middle" fontSize="22" fontWeight="700" fill={c.brand}>
            BlueForm
          </text>
          <text x="400" y="358" textAnchor="middle" fontSize="11" fill={c.muted}>
            calls t, then hands out strings
          </text>

          <Edge d="M150 246 L345 298" label="keys" lx={236} ly={256} />
          <Edge d="M450 246 L425 298" label="t + validationTranslation" lx={442} ly={276} anchor="start" />

          {/* your field component */}
          <Box x={20} y={308} w={168} h={60} title="your component" lines={['useField()']} />
          <Edge d="M298 338 L190 338" label="label · description" lx={244} ly={328} />
          <text x="244" y="354" textAnchor="middle" fontSize="11" fill={c.muted}>
            errorMessage
          </text>

          {/* rendered field */}
          <Edge d="M502 338 L560 338" />
          <text x="580" y="292" fontSize="13" fontWeight="600" fill={c.text}>
            Email *
          </text>
          <rect x="580" y="302" width="200" height="32" rx="6" fill="none" stroke={c.error} strokeWidth="1.5" />
          <text x="580" y="356" fontSize="12" fill={c.muted}>
            May this message find u
          </text>
          <text x="580" y="376" fontSize="12" fill={c.error}>
            Email is required
          </text>
          <text x="680" y="420" textAnchor="middle" fontSize="11" fill={c.muted}>
            what the user sees
          </text>
        </svg>
      </div>
      <figcaption>
        Dashed: what you write, as keys. <code>validationTranslation</code> turns <code>required: true</code> into the
        key <code>validation.required</code>, and BlueForm fills <code>{'{field}'}</code> with the translated label.
      </figcaption>
    </figure>
  )
}
