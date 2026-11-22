import { useState } from 'react'
import { Form, defineConfig } from './form.setup'

type Feedback = {
  rating: number
  name: string
  email: string
  city: string
  tags: { label: string }[]
}

const tagConfig = defineConfig<{ label: string }>({
  label: { type: 'text', label: 'Tag', rules: { required: 'Tag is required' } },
})

const box = {
  border: '1px dashed var(--bf-border)',
  borderRadius: 8,
  padding: '0.75rem 1rem',
  marginBottom: '0.75rem',
} as const

function EgRenderForm() {
  const [payload, setPayload] = useState<Feedback>()
  return (
    <Form<Feedback>
      defaultValues={{ tags: [{ label: 'docs' }] }}
      config={{
        // inline: `render` draws the whole field from the props it receives
        rating: {
          type: 'inline',
          label: 'Rating',
          rules: { required: 'Pick a rating' },
          render: ({ value, onChange, label, errorMessage, required }) => (
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ marginRight: 10 }}>
                {label} {required && '*'}
              </span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  aria-pressed={value === star}
                  onClick={() => onChange(star)}
                  style={{ border: 0, background: 'none', fontSize: 22, cursor: 'pointer', padding: 2 }}
                >
                  {value >= star ? '★' : '☆'}
                </button>
              ))}
              {errorMessage && <div className="fieldError">{errorMessage}</div>}
            </div>
          ),
        },
        // mapped field: `render` decorates `self`, the registered `text` component
        name: {
          type: 'text',
          label: 'Name',
          rules: { required: 'Name is required' },
          render: ({ self }) => (
            <div style={box}>
              {self}
              <small style={{ color: 'var(--bf-text-muted)' }}>Shown on your public profile</small>
            </div>
          ),
        },
        // section: `render` wraps `children`, the section's own fields
        __contact: {
          type: 'section',
          label: 'Contact',
          render: ({ label, children }) => (
            <fieldset style={box}>
              <legend>{label}</legend>
              {children}
            </fieldset>
          ),
          props: {
            config: defineConfig<Feedback>({
              email: { type: 'text', label: 'Email', props: { type: 'email' } },
              city: { type: 'text', label: 'City' },
            }),
          },
        },
        // array: `render` is the shell; each row comes from `renderItem`
        tags: {
          type: 'array',
          label: 'Tags (max 3)',
          rules: { maxLength: { value: 3, message: 'At most 3 tags' } },
          render: ({ label, items, renderItem, append, remove, errorMessage }) => (
            <fieldset style={box}>
              <legend>{label}</legend>
              {items.map((item, index) => (
                <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'end', marginBottom: 8 }}>
                  {renderItem(item, index)}
                  <button type="button" onClick={() => remove(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => append({ label: '' })}>
                + Add tag
              </button>
              {errorMessage && <div className="fieldError">{errorMessage}</div>}
            </fieldset>
          ),
          props: { config: tagConfig },
        },
      }}
      onSubmit={data => setPayload(data)}
    >
      <button type="submit">Submit</button>
      {payload && <pre data-testid="payload">{JSON.stringify(payload, null, 2)}</pre>}
    </Form>
  )
}

export default EgRenderForm
