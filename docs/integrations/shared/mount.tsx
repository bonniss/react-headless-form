import { type ComponentType, type ReactNode, StrictMode, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createDemoForm, defaultValues } from './config'
import { type Lang, TranslatorContext, createTranslator } from './i18n'
import type { Fields, Shells } from './types'

type Options = {
  /** Library provider / theme around the demo (e.g. MantineProvider). */
  Wrapper?: ComponentType<{ children: ReactNode }>
}

const Passthrough = ({ children }: { children: ReactNode }) => <>{children}</>

/** Renders the shared demo form with one library's adapters, a language switch and the submitted payload. */
export function mountDemo(fields: Fields, shells: Shells, { Wrapper = Passthrough }: Options = {}) {
  const { Form, buildConfig } = createDemoForm(fields, shells)

  function Demo() {
    const [lang, setLang] = useState<Lang>('en')
    const [payload, setPayload] = useState<unknown>()
    const t = useMemo(() => createTranslator(lang), [lang])
    const config = useMemo(() => buildConfig(t), [t])

    return (
      <TranslatorContext.Provider value={t}>
        <Wrapper>
          <div style={{ display: 'grid', gap: 24, padding: 16, maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8 }} role="group" aria-label="Language">
              {(['en', 'ja'] as const).map(code => (
                <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
                  {code === 'en' ? 'English' : '日本語'}
                </button>
              ))}
            </div>
            <Form
              config={config}
              defaultValues={defaultValues}
              i18nConfig={{
                t,
                // `{field}` receives the translated label
                validationTranslation: { required: 'validation.required', pattern: 'validation.pattern' },
              }}
              // hidden fields (adminCode) leave the payload
              formOptions={{ shouldUnregister: true }}
              onSubmit={data => setPayload(data)}
            />
            {payload !== undefined && (
              <pre data-testid="payload" style={{ margin: 0, padding: 12, fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(payload, null, 2)}
              </pre>
            )}
          </div>
        </Wrapper>
      </TranslatorContext.Provider>
    )
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Demo />
    </StrictMode>,
  )
}
