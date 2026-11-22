import { type ComponentType, type ReactNode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useFormRef, useFormState } from 'react-headless-form'
import type { FieldErrors } from 'react-hook-form'
import { type Profile, computedPaths, createDemoForm, defaultValues } from './config'
import { type Lang, TranslatorContext, createTranslator, languageOptions, useT } from './i18n'
import type { Fields, Shells } from './types'

/*
 * The demo stage: a fixed header (language switch, status, submit), the form,
 * and a drawer with the submitted payload. The stage itself is styled
 * neutrally on purpose: everything inside the form is the library's.
 */

type Options = {
  /** Library provider / theme around the demo (e.g. MantineProvider). */
  Wrapper?: ComponentType<{ children: ReactNode }>
}

const FORM_ID = 'demo-form'
const Passthrough = ({ children }: { children: ReactNode }) => <>{children}</>

type FieldError = { path: string; message: string }

/** Flattens RHF errors to `{ path, message }` (e.g. `lines.1.price`); an array-level error uses the array path. */
function flattenErrors(errors: FieldErrors, prefix = ''): FieldError[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    if (!value || typeof value !== 'object') return []
    const path = key === 'root' ? prefix : prefix ? `${prefix}.${key}` : key
    const message = (value as { message?: unknown }).message
    if (typeof message === 'string' && message) return [{ path, message }]
    return flattenErrors(value as FieldErrors, path)
  })
}

/** Reports live errors from inside the form (useFormState needs the form context). */
function ErrorsBridge({ onChange }: { onChange: (errors: FieldError[]) => void }) {
  const { errors, submitCount } = useFormState()
  const list = submitCount ? flattenErrors(errors) : []
  const key = JSON.stringify(list)
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed by content
  useEffect(() => onChange(list), [key])
  return null
}

const computedPatterns = computedPaths.map(
  pattern => new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '\\d+')}$`),
)
const isComputed = (path: string) => computedPatterns.some(re => re.test(path))

const tone = { ok: '#15803d', error: '#b91c1c', muted: '#6b7280', key: '#1d4ed8', computed: '#7c3aed' }

function ComputedTag() {
  const t = useT()
  return (
    <span style={{ marginLeft: 6, padding: '0 6px', borderRadius: 999, fontSize: 11, color: '#fff', background: tone.computed }}>
      {t('shell.computed')}
    </span>
  )
}

/** The payload as a key / value tree, with computed values tagged. */
function PayloadTree({ value, path = '' }: { value: unknown; path?: string }) {
  if (value === null || typeof value !== 'object') {
    return <span style={{ color: typeof value === 'number' ? '#b45309' : '#0f766e' }}>{JSON.stringify(value)}</span>
  }
  const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value)
  return (
    <ul style={{ listStyle: 'none', margin: 0, paddingLeft: path ? 14 : 0, borderLeft: path ? '1px dashed #d1d5db' : 0 }}>
      {entries.map(([key, child]) => {
        const childPath = path ? `${path}.${key}` : key
        return (
          <li key={key} style={{ margin: '2px 0' }}>
            <span style={{ color: tone.key }}>{key}</span>
            {': '}
            <PayloadTree value={child} path={childPath} />
            {isComputed(childPath) && <ComputedTag />}
          </li>
        )
      })}
    </ul>
  )
}

/** Renders the shared demo form with one library's adapters inside the demo stage. */
export function mountDemo(fields: Fields, shells: Shells, { Wrapper = Passthrough }: Options = {}) {
  const { Form, buildConfig } = createDemoForm(fields, shells)
  const { LanguageSwitch, SubmitButton } = shells

  function Demo() {
    const [lang, setLang] = useState<Lang>('en')
    const [payload, setPayload] = useState<Partial<Profile>>()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [errorList, setErrorList] = useState<FieldError[]>([])
    const [showErrors, setShowErrors] = useState(false)
    const t = useMemo(() => createTranslator(lang), [lang])
    const config = useMemo(() => buildConfig(t), [t])
    const formRef = useFormRef<Profile>()

    // Messages are stored when a field is validated: after a language switch,
    // validate the failing fields again to get them in the new language.
    // biome-ignore lint/correctness/useExhaustiveDependencies: only on language change
    useEffect(() => {
      if (formRef.current && errorList.length) void formRef.current.trigger(errorList.map(e => e.path) as never)
    }, [t])

    const focus = (path: string) => {
      setShowErrors(false)
      try {
        formRef.current?.setFocus(path as never)
      } catch {
        // array-level errors have no input to focus
      }
    }

    return (
      <TranslatorContext.Provider value={t}>
        <Wrapper>
          <header style={header}>
            <LanguageSwitch value={lang} options={languageOptions} onChange={value => setLang(value as Lang)} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              {errorList.length > 0 ? (
                <button type="button" data-testid="status-errors" onClick={() => setShowErrors(v => !v)} style={chip(tone.error)}>
                  ⚠ {t('shell.errors', { count: errorList.length })}
                </button>
              ) : payload ? (
                <button type="button" data-testid="status-ok" onClick={() => setDrawerOpen(true)} style={chip(tone.ok)}>
                  ✓ {t('shell.submitted')}
                </button>
              ) : null}
            </div>
            <SubmitButton form={FORM_ID}>{t('action.save')}</SubmitButton>
            {showErrors && errorList.length > 0 && (
              <ul data-testid="error-list" style={popover}>
                {errorList.map(error => (
                  <li key={error.path}>
                    <button type="button" onClick={() => focus(error.path)} style={errorRow}>
                      <code style={{ color: tone.muted }}>{error.path}</code>
                      <span>{error.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </header>

          <main style={{ maxWidth: 440, margin: '0 auto', padding: '72px 16px 32px' }}>
            <Form
              ref={formRef}
              config={config}
              defaultValues={defaultValues}
              i18nConfig={{
                t,
                // `{field}` receives the translated label
                validationTranslation: {
                  required: 'validation.required',
                  pattern: 'validation.pattern',
                  maxLength: 'validation.maxLength',
                },
              }}
              // hidden fields (adminCode) leave the payload
              formOptions={{ shouldUnregister: true }}
              onSubmit={data => {
                setPayload(data)
                setDrawerOpen(true)
              }}
              onInvalid={() => setShowErrors(true)}
            >
              <ErrorsBridge onChange={setErrorList} />
            </Form>
          </main>

          {drawerOpen && payload && (
            <aside data-testid="payload-drawer" style={drawer}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <strong>{t('shell.payload')}</strong>
                <button type="button" onClick={() => setDrawerOpen(false)} style={chip(tone.muted)}>
                  {t('shell.close')}
                </button>
              </div>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, lineHeight: 1.6 }}>
                <PayloadTree value={payload} />
              </div>
              {!('adminCode' in payload) && (
                <p style={{ color: tone.muted, fontSize: 12, marginTop: 16 }}>
                  {t('shell.dropped')}: <code>adminCode</code>
                </p>
              )}
            </aside>
          )}
        </Wrapper>
      </TranslatorContext.Provider>
    )
  }

  // No StrictMode: its simulated unmount / remount drops the values of rows
  // added with useFieldArray when shouldUnregister is true (react-hook-form
  // re-registers them from the initial defaultValues).
  const root = createRoot(document.getElementById('root')!)
  root.render(<Demo />)
  return root
}

const header = {
  position: 'fixed' as const,
  inset: '0 0 auto 0',
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 16px',
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(6px)',
  borderBottom: '1px solid #e5e7eb',
}

const chip = (color: string) => ({
  cursor: 'pointer',
  border: `1px solid ${color}`,
  color,
  background: '#fff',
  borderRadius: 999,
  padding: '2px 10px',
  font: 'inherit',
  fontSize: 13,
})

const popover = {
  position: 'absolute' as const,
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  margin: '4px 0 0',
  padding: 6,
  listStyle: 'none',
  width: 'min(380px, 92vw)',
  maxHeight: 280,
  overflow: 'auto',
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
}

const errorRow = {
  display: 'grid',
  gap: 2,
  width: '100%',
  textAlign: 'left' as const,
  padding: '6px 8px',
  border: 0,
  borderRadius: 6,
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
  fontSize: 13,
}

const drawer = {
  position: 'fixed' as const,
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 200,
  width: 'min(340px, 90vw)',
  overflow: 'auto',
  padding: 16,
  background: '#fff',
  borderLeft: '1px solid #e5e7eb',
  boxShadow: '-8px 0 24px rgba(0,0,0,0.12)',
}
