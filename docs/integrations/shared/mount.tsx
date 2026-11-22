import { type ComponentType, type ReactNode, StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useFormRef } from 'react-headless-form'
import { type Profile, createDemoForm, defaultValues } from './config'
import { type Lang, TranslatorContext, createTranslator } from './i18n'
import type { Fields, Shells } from './types'

type Options = {
  /** Library provider / theme around the demo (e.g. MantineProvider). */
  Wrapper?: ComponentType<{ children: ReactNode }>
}

const Passthrough = ({ children }: { children: ReactNode }) => <>{children}</>

// Fields with validation rules. Error messages are stored when a field is
// validated, so after a language switch the failing ones are validated
// again to get their messages in the new language.
const VALIDATED_FIELDS = ['name', 'email', 'adminCode'] as const

/** Renders the shared demo form with one library's adapters, a language switch and the submitted payload. */
export function mountDemo(fields: Fields, shells: Shells, { Wrapper = Passthrough }: Options = {}) {
  const { Form, buildConfig } = createDemoForm(fields, shells)

  function Demo() {
    const [lang, setLang] = useState<Lang>('en')
    const [payload, setPayload] = useState<unknown>()
    const t = useMemo(() => createTranslator(lang), [lang])
    const config = useMemo(() => buildConfig(t), [t])
    const formRef = useFormRef<Profile>()

    useEffect(() => {
      const form = formRef.current
      if (!form) return
      const failing = VALIDATED_FIELDS.filter(name => form.getFieldState(name).error)
      if (failing.length) void form.trigger(failing)
    }, [t, formRef])

    return (
      <TranslatorContext.Provider value={t}>
        <Wrapper>
          <div style={{ display: 'grid', gap: 16, padding: 16, maxWidth: 440, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }} role="group" aria-label="Language">
              {(['en', 'ja'] as const).map(code => (
                <shells.LanguageButton key={code} active={lang === code} onClick={() => setLang(code)}>
                  {code === 'en' ? 'English' : '日本語'}
                </shells.LanguageButton>
              ))}
            </div>
            <Form
              ref={formRef}
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
