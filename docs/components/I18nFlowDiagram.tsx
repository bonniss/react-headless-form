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
