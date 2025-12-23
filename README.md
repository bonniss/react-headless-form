# BlueForm - a headless form for React

> Form as configuration. Bring your own UI, entirely. Great DX. Built on React Hook Form.

## Introduction

**BlueForm** is a headless form orchestration layer built on top of React Hook Form.

React Hook Form (RHF) is brilliant. It removes a large amount of boilerplate and makes building forms faster and easier. But as applications grow, the patterns used to wire RHF itself often become the next layer of boilerplate.

You copy and paste setup logic from previous apps, slightly adjusting it each time. You stop to think about questions about wiring details: should this input use register, useController, or `<Controller />` to integrate this field with a new UI library? These decisions are not hard individually, but they add friction. Over time, teams accumulate multiple patterns for doing essentially the same thing. The real challenge becomes orchestration: how fields are described, how they are composed, how behavior is expressed, and how form logic stays consistent as complexity grows.

With BlueForm, building a form becomes a structured process:

**0. Define your fields**
Create your own reusable building blocks: selects, checkbox groups, or any domain-specific UI. In BlueForm, this is called `fieldMapping`. The built-in field types allow you to start even without defining one.

**1. Define how your root form element is rendered**
Decide how the form itself is structured: form, grid layout, wizard container, or anything else.

**2. Describe your form as configuration**
Compose your form using your own fields, validation rules, layout-related properties, and built-in structural types.

**3. Define form behavior**
Handle submission, side effects, conditional visibility, and integrations—without coupling them to layout.

**4. (Not really a step — you now have a working form.)**

The reason step **0** comes first is intentional. In most applications, fields are defined far less frequently than forms themselves. You usually have a clear idea of the input shapes your domain requires, and once those fields exist, they are reused across many forms. Similarly, step **1** is often optional. Many applications share the same root form structure, meaning you define it once and rarely touch it again.

With BlueForm, you focus on form structure — how fields are organized, how they relate to each other, and how the form behaves as a whole. UI becomes an implementation detail, not the driving concern.

## Talk is cheap, show me the code

```sh
npm install blueform
```

### A Login form

#### The field

Obviously, we start with a native HTML input.

```tsx
import { useField } from "blueform"

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement>

export default function InputField(props: InputFieldProps) {
  const {
    fieldProps: { value, onChange, label, errorMessage, required, disabled },
  } = useField<string>()

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label>
          {label} {required && "*"}
        </label>
      )}

      <input
        {...props}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{ display: "block", marginTop: 4 }}
      />

      {errorMessage && (
        <div style={{ color: "red", marginTop: 4 }}>{errorMessage}</div>
      )}
    </div>
  )
}
```

#### The form

```tsx
import { setupForm, defineFieldMapping } from "blueform"
import InputField from "./InputField"

// Define the field mapping
const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: InputField,
  }),
  // Define how the root form is rendered
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
})

export default function LoginPage() {
  return (
    <Form<LoginForm>
      // Describe the form as configuration
      config={defineConfig({
        username: {
          type: "text",
          label: "Username",
          rules: {
            required: "Username is required",
          },
        },
        password: {
          type: "text",
          label: "Password",
          props: {
            type: "password",
          },
          rules: {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "",
            },
          },
        },
      })}
      // Form submit behavior
      onSubmit={(data) => {
        console.log("login data:", data)
      }}
    >
      <button type="submit">Login</button>
    </Form>
  )
}
```

The form just works without needing to understand many details about how RHF works under the hood.

### More examples

Visit our ladle story book for core and advanced examples.

## Builtin types

BlueForm ships with a small set of built-in field types.

### `inline`

Inline fields are **one-off custom fields** defined directly in the form configuration.

```
nickname: {
  type: "inline",
  label: "Nickname",
  render: ({ fieldProps }) => (
    <input
      value={fieldProps.value ?? ""}
      onChange={(e) =>
        fieldProps.onChange?.(e.target.value)
      }
    />
  ),
}
```

Use `inline` when:

- the field is highly specific or not reused elsewhere
- defining a reusable field component is unnecessary

### `ui`

UI fields are **render-only nodes**.

```ts
notice: {
  type: "ui",
  render: () => <Divider />,
}
```

UI fields:

- should not participate in form state
- should not affect validation or submission

`ui` is helpful for purely for layout or visual structure.

### `group`

Groups allow you to nest fields and structure the form hierarchically.

```ts
profile: {
  type: "group",
  label: "Profile",
  props: {
    config: defineConfig({
      firstName: { type: "inline" },
      lastName: { type: "inline" },
    }),
  },
}
```

### `array`

Arrays represent **repeatable groups of fields**.

```ts
addresses: {
  type: "array",
  label: "Addresses",
  props: {
    config: defineConfig({
      street: { type: "inline" },
      city: { type: "inline" },
    }),
  },
}
```

Array fields are backed by RHF’s `useFieldArray` under the hood.

### `hidden`

Hidden fields participate in form state but render no visible UI.

```ts
token: {
  type: "hidden",
  defaultValue: "abc123",
}
```

That said, even with just these built-in field types, you can cover quite of use cases. For example, the login form shown earlier can be implemented entirely using `inline` fields.

```tsx
import { setupForm } from "@/components/form/setup"

type LoginForm = {
  username: string
  password: string
}

const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
})

export default function LoginPage() {
  return (
    <Form<LoginForm>
      onSubmit={(data) => {
        console.log("login data:", data)
      }}
      config={defineConfig({
        username: {
          type: "inline",
          label: "Username",
          rules: {
            required: "Username is required",
          },
          render: ({
            fieldProps: { value, onChange, label, errorMessage },
          }) => (
            <div style={{ marginBottom: 12 }}>
              <label>{label}</label>
              <input
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
              />
              {errorMessage && (
                <div style={{ color: "red" }}>{errorMessage}</div>
              )}
            </div>
          ),
        },

        password: {
          type: "inline",
          label: "Password",
          rules: {
            required: "Password is required",
          },
          render: ({
            fieldProps: { value, onChange, label, errorMessage },
          }) => (
            <div style={{ marginBottom: 12 }}>
              <label>{label}</label>
              <input
                type="password"
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
              />
              {errorMessage && (
                <div style={{ color: "red" }}>{errorMessage}</div>
              )}
            </div>
          ),
        },
      })}
    >
      <button type="submit">Login</button>
    </Form>
  )
}
```

To summarize:

| Type     | Renders UI | In form state | Submitted |
| -------- | ---------- | ------------- | --------- |
| `inline` | ✓          | ✓             | ✓         |
| `ui`     | ✓          | ✗             | ✗         |
| `group`  | ✓          | ✓             | ✓         |
| `array`  | ✓          | ✓             | ✓         |
| `hidden` | ✗          | ✓             | ✓         |

## Setting up a form

BlueForm does not expose a single global `<Form />` component.

Instead, forms are created through a **setup step** using `setupForm` to ensure **strong type safety**, especially around `fieldMapping`.

### Why?

`setupForm` does two things:

1. It **binds a field mapping** to a form instance
2. It returns a **typed `Form` component** and a **typed `defineConfig` helper**

```ts
const [Form, defineConfig] = setupForm({
  fieldMapping,
  renderRoot,
  i18nConfig,
})
```

This setup step establishes a contract:

- which field types are available
- how those fields are rendered
- which configuration shape is valid

Once this contract is defined, it applies consistently to all forms created from it.

### `fieldMapping` is part of the type system

`fieldMapping` is not just a runtime object—it directly influences the **TypeScript types** of your form configuration.

```ts
const [Form, defineConfig] = setupForm({
  fieldMapping: defineFieldMapping({
    text: TextField,
    select: SelectField,
  }),
})
```

From this point on:

- only `text` and `select` are valid field types
- invalid field types are caught at compile time
- field-specific props are type-checked

```ts
defineConfig({
  username: {
    type: "text", // ✅ valid
  },
  role: {
    type: "checkbox", // ❌ type error
  },
})
```

### The `Form` is typed

The `Form` component returned by `setupForm` is **generic over your form model**:

```tsx
<Form<LoginForm>
  config={defineConfig({
    username: { type: "text" },
    password: { type: "text" },
  })}
  onSubmit={(data) => {
    // data is strongly typed as LoginForm
  }}
/>
```

This gives you:

- fully typed `onSubmit` data
- typed access to form methods
- compile-time guarantees that your configuration matches your data model

## Field authoring

### `useField`

Every field component interacts with the form through a shared contract, exposed via `useField`. It exposes a **stable, normalized interface** on top of RHF’s `useController`, so field authors do not need to interact with RHF directly.

```ts
const { fieldProps, controller, config } = useField()
```

In most cases, **you only need `fieldProps`**. It contains **everything a field needs to render itself correctly**, without knowing anything about the rest of the form.

#### `fieldProps`

`fieldProps` is the primary object used to build field UI.
It contains **everything a field needs to render itself correctly**, without knowing anything about the rest of the form.

##### Value and interaction

```ts
fieldProps.value
fieldProps.onChange
```

- `value`
  The current field value, sourced from RHF via `useController`.

- `onChange`
  A change handler that **expects the final value**, not a DOM event.

```tsx
onChange?.(e.target.value) // ✅ correct
onChange?.(e) // ❌ incorrect
```

##### Error handling

```ts
fieldProps.errorMessage
```

- A translated error message derived from RHF’s validation state
- Ready to be rendered directly

```tsx
{
  errorMessage && <div>{errorMessage}</div>
}
```

Field components **should not inspect validation rules or error objects** — only display this message.

##### Identity and structure

```ts
fieldProps.id
fieldProps.name
fieldProps.path
fieldProps.namespace
```

- `name`
  The field key within its immediate object (e.g. `"email"`)

- `path`
  The full path used by RHF (e.g. `"profile.email"`)

- `namespace`
  The parent scope, when the field is nested

These values are useful for:

- accessibility (`id`, `htmlFor`)
- debugging
- advanced integrations

##### Labeling and metadata

```ts
fieldProps.label
fieldProps.description
fieldProps.required
```

- `label`
  A translated label, already resolved by BlueForm

- `description`
  Optional helper text, also translated

- `required`
  A boolean derived from validation rules

Field components should **not infer `required` from rules themselves**.

##### Read-only and disabled state

```ts
fieldProps.disabled
fieldProps.readOnly
fieldProps.readOnlyEmptyFallback
```

- `disabled`
  Indicates the field should not accept interaction

- `readOnly`
  Indicates the field should display its value without allowing edits

- `readOnlyEmptyFallback`
  Optional content to render when the value is empty and the form is read-only

A typical pattern:

```tsx
if (readOnly && readOnlyEmptyFallback) {
  return <div>{readOnlyEmptyFallback}</div>
}
```

##### Visibility

```ts
fieldProps.visible
```

- Indicates whether the field should be rendered
- Visibility is **resolved at the orchestration level**
- Field components should simply respect it

```tsx
if (!visible) return null
```

#### `controller`

```ts
const { controller } = useField()
```

This is the raw result of RHF’s `useController`.

Most fields **should not need this**.

Use `controller` only when:

- integrating deeply with third-party components
- needing access to `fieldState` or `formState`
- handling non-standard input behavior

#### `config`

```ts
const { config } = useField()
```

- The original field configuration object
- Useful for highly dynamic or meta-driven fields
- Not required for standard field rendering

### `useArrayField`

`useArrayField` is the field-level API for working with **array fields**. It provides a thin, predictable abstraction on top of RHF’s `useFieldArray`.

```ts
const { fieldProps, controller, renderItem } = useArrayField()
```

You typically use `useArrayField` in a dedicated component (recommended), or directly inside the render logic of the built-in `array` type.

### `fieldProps`

```ts
fieldProps.errorMessage
fieldProps.label
fieldProps.required
fieldProps.disabled
```

`fieldProps` behaves the same way as in `useField`, but at the **array level**.

- `errorMessage`
  Represents array-level validation errors (e.g. `minLength`, `required`)

This allows you to display errors related to the array itself, not individual items.

```tsx
{
  fieldProps.errorMessage && <div>{fieldProps.errorMessage}</div>
}
```

### `controller`

```ts
const { fields, append, remove, insert, move } = controller
```

`controller` is the result of RHF’s `useFieldArray`.

It exposes imperative helpers for managing array items:

- `append`
- `remove`
- `insert`
- `move`
- `swap`
- `replace`

BlueForm does not wrap or hide these APIs.
If you know `useFieldArray`, you already know how to use this.

### `renderItem`

```ts
renderItem(field, index)
```

`renderItem` is a helper function that renders a **single array item**.

Internally, it:

- resolves the correct namespace (e.g. `addresses.0`)
- renders the item configuration via `BlueFormEngine`
- ensures nested fields are properly registered

You usually use it like this:

```tsx
{
  controller.fields.map(renderItem)
}
```

## A complete array field example

```tsx
addresses: {
  type: "array",
  label: "Addresses",
  render: ({ fieldProps, children }) => {
    const { controller, renderItem } = useArrayField()

    return (
      <fieldset>
        <legend>{fieldProps.label}</legend>

        {controller.fields.map(renderItem)}

        <button
          type="button"
          onClick={() => controller.append({})}
        >
          Add address
        </button>

        {fieldProps.errorMessage && (
          <div>{fieldProps.errorMessage}</div>
        )}
      </fieldset>
    )
  },
  props: {
    config: defineConfig({
      street: { type: "inline" },
      city: { type: "inline" },
    }),
  },
}
```

## Internationalization (i18n)

BlueForm handles i18n at the **form orchestration level**, not inside field components. Labels, descriptions, and validation messages are translated **before** they reach fields.
Field components always receive ready-to-render strings.

```ts
fieldProps.label
fieldProps.description
fieldProps.errorMessage
```

Fields should never need to know about locales or translation libraries.

### Basic setup

i18n is configured once during `setupForm`. i18n is completely optional. If no `i18nConfig` is provided, all text values are treated as plain strings. 

```ts
const [Form, defineConfig] = setupForm({
  i18nConfig: {
    t: (message, params) => translate(message, params),
  },
})
```

### Translating validation messages

```ts
const [Form, defineConfig] = setupForm({
  i18nConfig: {
    validationTranslation: {
      required: "validation.required",
    },
    t: (message, params) => `${params?.field} is required`,
  },
})
```

Validation rules remain standard RHF rules.

### Example: using i18next

```ts
import i18next from "i18next"

const [Form, defineConfig] = setupForm({
  i18nConfig: {
    t: (key, params) => i18next.t(key, params),
    validationTranslation: {
      required: "validation.required",
    },
  },
})
```

```ts
defineConfig({
  username: {
    type: "text",
    label: "form.username.label",
    description: "form.username.description",
    rules: {
      required: true,
    },
  },
})
```

## License

[MIT](LICENSE)
