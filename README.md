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

With **BlueForm**, building a form becomes a structured process:

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

#### 0. Define the data model

You want to collect an username and password from user.

```tsx
type LoginData = {
  username: string;
  password: string;
}
```

A native HTML `<input />` is enough to describe both fields — one with type `text`, the other with type `password`. Once you’re familiar with the flow, the same approach works with any UI library. Let's define a reusable `InputField`.

#### 1. Describe the field

```tsx
import { useField } from "react-headless-form"

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement>

export default function InputField(props: InputFieldProps) {
  const {
    fieldProps: { value, onChange, label, errorMessage, required, disabled },
  } = useField()

  return (
    <div>
      {label && (
        <label>
          {label} {required && "*"}
        </label>
      )}

      <input
        {...props}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      />

      {errorMessage && (
        <div className="text-red-600 mt-2">{errorMessage}</div>
      )}
    </div>
  )
}
```

Notice that the field receives everything it needs to be functional without needing to know where those values come from. It only cares about how and where things are rendered, while all logic is handled by the form engine.
This makes field components reusable. See [Field authoring](#field-authoring) for more details.

#### 2. Describe the form

```tsx
import { setupForm, defineMapping } from "react-headless-form"
import InputField from "./InputField"

// Set up Form component
const [Form] = setupForm({
  // Define the field mapping
  fieldMapping: defineMapping({
    text: InputField,
  }),
  // Define how the root form is rendered
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
})

export function LoginForm() {
  return (
    <Form<LoginData>
      // Describe the form as configuration
      config={{
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
              message: "Password too short",
            },
          },
        },
      }}
      // Define form behavior, data is recognized as LoginData
      onSubmit={(data) => {
        console.log("Login data:", data)
      }}
    >
      <button type="submit">Login</button>
    </Form>
  )
}
```

The form is described entirely as configuration. Field types are mapped to components, validation rules are declared alongside each field, and `onSubmit` receives fully typed form data.

### The mighty `Form`

This package does not expose a single global `<Form />` component. Instead, each `Form` is created through a setup step, where a **base configuration** is defined and bound to the form instance.

This setup determines how the form behaves by default: which field types are available, how the root form is rendered, and how validation or i18n is handled. Once created, the resulting `Form` component comes with several key advantages:

- it is bound to a specific **field mapping**, restricting valid field types at compile time
- it is bound to a **form data model**, ensuring strong typing for configuration and submission

#### Bound to a field mapping

When a `Form` is created, it is bound to a specific field mapping.
This mapping defines which field types are available and how they are rendered.

By default, BlueForm provides a set of built-in field types
(`inline`, `ui`, `group`, `array`, `hidden`).
Calling `setupForm()` with no arguments uses only these built-in types.

```ts
const [Form] = setupForm()
```

To extend the form with custom fields while keeping all built-in ones available, use `defineMapping`:

```ts
const [Form] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
    select: SelectField,
  }),
})
```

With this setup, valid field types include:

- all built-in field types
- `"text"` and `"select"` defined above

Any unknown field type will be caught at compile time.

```ts
config={{
  username: {
    type: "text", // ✅ custom
  },
  profile: {
    type: "group", // ✅ built-in
  },
  age: {
    type: "number", // ❌ compile-time error
  },
}}
```

#### Bound to a data model

`Form` is generic. Field keys must match the data model, and `onSubmit` always receives fully typed data.

```ts
<Form<LoginData>
  config={{
    username: {
      type: "text",
    },
    password: {
      type: "text",
    },
  }}
  onSubmit={(data) => {
    // data is inferred as LoginData
    data.username
    data.password
  }}
/>
```

#### Overriding base configuration

Base configuration defined in `setupForm` applies to all forms created from it.
In some cases, you may want to override this behavior for a specific form instance.

Most base options can be overridden via `<Form />` props at usage time. For example, `renderRoot` can be customized per form. Note that `renderRoot` must be provided either during setup or overridden at usage time, otherwise the form will throw an error.

```ts
const [Form] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <form className="default-form" onSubmit={onSubmit}>{children}</form>
  ),
})
```

```tsx
<Form
  renderRoot={({ children, onSubmit }) => (
    <form className="product-form" onSubmit={onSubmit}>{children}</form>
  )}
/>
```

Internationalization behavior can also be overridden when needed:

```ts
const [Form] = setupForm({
  i18nConfig: {
    t: defaultTranslate,
  },
})
```

```tsx
<Form
  i18nConfig={{
    t: adminTranslate,
  }}
/>
```

The only option that **cannot** be overridden is `fieldMapping`, even at runtime. It is fixed at setup time to preserve compile-time [type safety](#type-safety).

### `defineConfig` when needed

For flat form structures, `<Form<TModel>>` is enough as types flow naturally from `Form<TModel>` into the configuration. However, with nested structures, TypeScript can no longer infer the model shape automatically. In these cases, `defineConfig` - the second value returned from `setupForm` - is used to explicitly mark that typing boundary.

```tsx
type LoginData = {
  account: {
    username: string
    password: string
  }
}

const [Form, defineConfig] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
  }),
})

<Form<LoginData>
  config={{
    account: {
      type: "group",
      config: defineConfig<LoginData["account"]>({
        username: {
          type: "text",
        },
        password: {
          type: "text",
        },
      }),
    },
  }}
/>
```

Another common use case for `defineConfig` is to define configurations once and import them wherever needed, while still preserving the same field mapping and typing rules.

```ts
// form.setup.ts
import { setupForm, defineMapping } from "react-headless-form"
import InputField from "./InputField"

export const [Form, defineConfig] = setupForm({
  fieldMapping: defineMapping({
    text: InputField,
  }),
})
```

```ts
// login.form.ts
import type { LoginData } from "./types"
import { defineConfig } from "./form.setup"

export const loginFormConfig = defineConfig<LoginData>({
  username: {
    type: "text",
    label: "Username",
  },
  password: {
    type: "text",
    props: {
      type: "password",
    },
  },
})
```

```tsx
// LoginPage.tsx
import { Form } from "./form.setup"
import { loginFormConfig } from "./login.form"

<Form<LoginData>
  config={loginFormConfig}
  onSubmit={(data) => {
    console.log(data)
  }}
>
  <button type="submit">Login</button>
</Form>
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

### It's just type guidance, not runtime guarantee

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
<Form<LoginData>
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
