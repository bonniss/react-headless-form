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
