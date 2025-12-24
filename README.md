# React headless form

> Form as configuration. Bring your own UI, entirely. Great DX. Built on React Hook Form.

![blueform-typesafety](docs/media/blueform-typesafety.gif)

## ✨ Features

- 🧩 **Bring your own UI** — `value`, `onChange`, `label`, and form field essentials at your fingertips, without fighting RHF or TypeScript. You define your own field types: `text`, `select`, or even a `superman` field.
- ⚡ **Great DX** — set up the form once, get full type and prop hints from your TypeScript model, plus extra UI-only fields with zero TypeScript complaints.
- 🌍 **i18n-ready** — plug in any i18n solution (`i18next`, `react-intl` or your own), configure once, and labels, descriptions, and validation messages ready to fields without caring about the app language.
- 🧱 **Still just [React Hook Form](https://react-hook-form.com/)** — pass `useForm` options, access RHF hooks, and keep full control since fields live inside the form context.
- 🔍 **Visual inspection** — inspect your form with RHF DevTools using a one-line config, with support for easily defining your own plugins.
- 📱 **Platform-agnostic** — no web-specific assumptions. While not tested with React Native yet, compatibility should follow React Hook Form.

## Naming note

The package was originally named `blueform`, but npm rejected the publication because the name was deemed too similar to an existing package. We then switched to **react-headless-form** — a clear and descriptive name, though somewhat verbose. Unfortunately, abbreviating it as “RHF” isn’t practical, as that acronym is almost universally associated with **React Hook Form** (for the skeptics — just try googling “RHF”).

For this reason, throughout the documentation we refer to the library simply as **BlueForm**. This is a short, memorable codename carried over from the original `blueform` name, and it’s the term we’ve consistently used during development and design discussions.

## Introduction

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

## Getting started

### Installation

```sh
npm install react-headless-form
```

### Your first form - A login form

#### Describe the field

Obviously, we start with a native HTML input.

```tsx
import { useField } from "react-headless-form"

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement>

export default function InputField(props: InputFieldProps) {
  const {
    fieldProps: { value, onChange, label, errorMessage, required, disabled },
  } = useField()

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

#### Describe the form

```tsx
import { setupForm, defineMapping } from "react-headless-form"
import InputField from "./InputField"

// Define the field mapping
const [Form, defineConfig] = setupForm({
  fieldMapping: defineMapping({
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

### Setting up a form

BlueForm does not expose a single global `<Form />` component. Instead, forms are created through a **setup step** using `setupForm` to ensure **strong type safety**. `setupForm` does two things:

1. It **binds a field mapping** to a form instance
2. It returns a **typed `Form` component** and a **typed `defineConfig` helper**

You can pass a base configuration to `setupForm` to define shared behavior.

```ts
const [Form, defineConfig] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
    select: SelectField,
  }),
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
  i18nConfig: {
    t: (message, params) => translate(message, params),
    validationTranslation: {
      required: "validation.required",
    },
  },
})
```

All arguments are **optional**. You can also provide or override them later via `<Form />` props — these will take precedence over the values passed to `setupForm`. The only exception is `fieldMapping`: it cannot be overridden because it isn't just a runtime object — it **directly shapes the TypeScript types** of your form configuration. It's is required to use `defineMapping` to ensures that all **built-in field types** (`inline`, `ui`, `group`, `array`, `hidden`) remain available by default. You can then extend or override them with your own custom fields:

```ts
const [Form, defineConfig] = setupForm({
  fieldMapping: defineMapping({
    // Your custom fields
    text: TextField,
    select: SelectField,

    // You can optionally override built-in ones if needed
    ui: MyCustomUIField,
    hidden: MyCustomHiddenField
  }),
})
```

With the configuration above:

- Only `"text"` and `"select"` plus built-in types are valid field types.
- Invalid field types are caught at **compile time**.
- Props specific to each field type are fully type-checked.

You can also call `setupForm()` with **no arguments** at all, which falls back to **built-in field types**:

```ts
const [Form] = setupForm()
```

The `Form` component returned by `setupForm` is **generic over your form model**. This means `defineConfig` is only needed when introducing a nested typing boundary (for example, `group`, `array`, or custom field configs). For flat keys, the form model type is inferred directly from `Form<TModel>`.

```tsx
<Form<LoginForm>
  // no need to `defineConfig`, types flow down from the Form
  config={{
    username: {
      // ...
    },
    password: {
      // ...
    },
  }}
  onSubmit={(data) => {
    // data is strongly typed as LoginForm
  }}
/>
```

### More examples

Visit [our ladle](https://bonniss.github.io/react-headless-form/) for more examples.

## Type safety

### Configuration keys

Form configuration keys are type-checked against your form model.

```ts
type User = {
  name: string
  profile: {
    email: string
  }
  addresses: {
    city: string
  }[]
}
```

For simple, non-nested fields like `name`, keys map directly to model properties:

```ts
{
  name: {
    type: "text",
  },
}
```

For nested fields, there are two options.

**Option A: Using built-in structural types**

Use `group` for nested objects:

```ts
{
  profile: {
    type: "group",
    props: {
      config: defineConfig<User["profile"]>({
        email: { type: "text" },
      }),
    },
  },
}
```

Use `array` for arrays of objects:

```ts
{
  addresses: {
    type: "array",
    props: {
      config: defineConfig<User["addresses"][number]>({
        city: { type: "text" },
      }),
    },
  },
}
```

When using `group` or `array`, you must call `defineConfig` again for the nested model (`User["profile"]`, `User["addresses"][number]`), since TypeScript cannot automatically infer nested object shapes across abstraction boundaries.

**Option B: Using flat nested keys**

Alternatively, you can use flat keys with dot notation without defining a nested config:

```ts
{
  "profile.email": {
    type: "text",
  },
}
```

Invalid paths are caught by Typescript:

```ts
"profile.age" // ❌ Type error – not part of User
```

Flat keys apply to **object paths only**; array paths are intentionally excluded, as their indices are resolved dynamically at runtime.

### Field props

Each field’s `type` maps directly to a component registered in `fieldMapping`.

```ts
const fieldMapping = defineMapping({
  text: InputField,
  select: SelectField,
})
```

BlueForm ensures that:

- `type` must exist in `fieldMapping`
- `props` must match the mapped component’s props

```ts
defineConfig<User>({
  name: {
    type: "text",
    props: {
      placeholder: "Your name", // ✅ valid
      options: [], // ❌ invalid for text field
    },
  },
})
```

### Virtual configuration key

In many forms, some nodes exist purely for layout or presentation like previews, separators, fieldset. Typically no one should modify the form model just to accommodate UI concerns. These elements simply **should not be checked against the form model**. BlueForm uses a simple convention: configuration keys starting with `__` are treated as **virtual keys**, and TypeScript will not complain about them.

```tsx
<Form<UserForm>
  config={{
    firstName: { type: "text" },
    lastName: { type: "text" },

    // Typescript will not rant this key
    __fullNamePreview: {
      type: "ui",
      render: () => <FullNamePreview />,
    },
  }}
/>
```

There are a few important caveats to be aware of. If your form model itself contains fields starting with `__`, those fields will no longer receive type suggestions in the configuration, as the prefix is reserved for virtual keys. Additionally, if you want a field to be type-safe and checked against the model, it must not be virtual—even if it uses a `ui`-like field type. In that case, the field must exist in the model.

### It's just type guidance, not runtime guarantee!

> [!IMPORTANT]
>
> The conventions described above are primarily designed to **support the type system and authoring experience**. They are not intended to strictly enforce runtime behavior.
>
> Fields still have full access to React Hook Form’s `useFormContext`, which means runtime side effects—such as reading or mutating form state—are always possible. It is therefore up to the developer to follow these conventions with intent and discipline, ensuring that UI-only nodes do not unintentionally modify form state.

## Built-in types

BlueForm ships with a small set of built-in field types.

| Type     | Renders UI | In form state | Submitted |
| -------- | ---------- | ------------- | --------- |
| `inline` | ✓          | ✓             | ✓         |
| `ui`     | ✓          | ✗             | ✗         |
| `group`  | ✓          | ✓             | ✓         |
| `array`  | ✓          | ✓             | ✓         |
| `hidden` | ✗          | ✓             | ✓         |

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

UI fields are **render-only nodes**. It should meant to be for purely for layout or visual structure, and should be named as a virtual field.

```tsx
__notice: {
  type: "ui",
  render: () => <Divider />,
}
```

### `group`

Groups allow you to nest fields and structure the form hierarchically.

```tsx
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

```tsx
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

```tsx
token: {
  type: "hidden",
  defaultValue: "abc123",
}
```

---

With just these built-in field types, you can cover quite of use cases. For example, the login form shown earlier can be implemented entirely using `inline` fields.

```tsx
<Form<LoginForm>
  config={{
    username: {
      type: "inline",
      label: "Username",
      rules: {
        required: "Username is required",
      },
      render: ({ fieldProps: { value, onChange, label, errorMessage } }) => (
        <div className="form-item">
          <label>{label}</label>
          <input
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
          />
          {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        </div>
      ),
    },

    password: {
      type: "inline",
      label: "Password",
      rules: {
        required: "Password is required",
      },
      render: ({ fieldProps: { value, onChange, label, errorMessage } }) => (
        <div className="form-item">
          <label>{label}</label>
          <input
            type="password"
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
          />
          {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        </div>
      ),
    },
  }}
/>
```

---

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
const [Form] = setupForm({
  i18nConfig: {
    t: (message, params) => translate(message, params),
  },
})
```

### Translating validation messages

```ts
const [Form] = setupForm({
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

const [Form] = setupForm({
  i18nConfig: {
    t: (key, params) => i18next.t(key, params),
    validationTranslation: {
      required: "validation.required",
    },
  },
})
```

```ts
{
  username: {
    type: "text",
    label: "form.username.label",
    description: "form.username.description",
    rules: {
      required: true,
    },
  },
}
```

## Devtools

BlueForm ships with an optional integration for [React Hook Form DevTools](https://react-hook-form.com/dev-tools), allowing you to inspect form state in real time during development.

This integration is designed as a plugin, not a core requirement.

```tsx
import devToolPlugin from "react-headless-form"
;<Form renderRoot={TestRoot} plugins={[devToolPlugin()]} />
```

## License

[MIT](LICENSE)
