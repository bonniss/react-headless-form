// G5: consumer type checks against the built declarations (see CONTRIBUTING.md).
import {
  setupForm, defineMapping, useField, useFormRef, defineDynamicConfig,
  useFormContext, useForm,
  type BlueFormRef, type BlueFormRefValue, type OnSubmitFailure,
  type TranslatableText, type DynamicFormConfig, type FieldChangeContext,
} from "react-headless-form";
import type { ReactNode } from "react";

type Eq<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const assert = <T extends true>() => {};

// ---- components with typed props
const TextInput = (_: { placeholder?: string; size?: "sm" | "md" }) => { useField(); return null; };
const Select = (_: { options: { value: string; label: string }[] }) => null;
const Root = ({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) => <form onSubmit={onSubmit}>{children}</form>;

const [Form, defineConfig, Section] = setupForm({
  renderRoot: Root,
  fieldMapping: defineMapping({ text: TextInput, select: Select }),
});

type User = { name: string; age: number; role: "admin" | "student"; profile: { city: string }; tags: { label: string }[] };

// ---- config: keys, type discriminant, props narrowing
const config = defineConfig<User>({
  name: { type: "text", props: { placeholder: "x", size: "sm" }, rules: { required: true, pattern: "^a" } },
  role: { type: "select", props: { options: [{ value: "a", label: "A" }] } },
  age: {
    type: "text",
    visible: (v) => { assert<Eq<typeof v, Partial<User>>>(); return v.role === "student"; },
    required: (v) => v.age! > 1,
    deps: ["role", "profile.city"],
    slots: { before: <b />, after: ({ value, label }) => <i>{String(value)}{label}</i> },
  },
  __divider: { type: "inline", render: () => <hr /> },
  profile: { type: "section", props: { nested: true, config: { city: { type: "text" } } } },
});

// ---- condition context (second argument of visible / disabled / required)
defineConfig<User>({
  name: {
    type: "text",
    visible: (_, ctx) => {
      assert<Eq<typeof ctx.path, string>>();
      assert<Eq<typeof ctx.namespace, string | undefined>>();
      return Boolean(ctx.scope);
    },
    disabled: (_, { name }) => name === "name",
  },
});
defineConfig<User>({
  // @ts-expect-error condition functions must return a boolean
  name: { type: "text", visible: (_, ctx) => ctx.path },
});

defineConfig<User>({
  // @ts-expect-error unknown model key
  nmae: { type: "text" },
});
defineConfig<User>({
  // @ts-expect-error unknown field type
  name: { type: "textarea" },
});
defineConfig<User>({
  // @ts-expect-error wrong props for "text"
  name: { type: "text", props: { size: "xl" } },
});
defineConfig<User>({
  // @ts-expect-error props of select missing options
  role: { type: "select", props: {} },
});
defineConfig<User>({
  // @ts-expect-error deps must be model paths
  age: { type: "text", deps: ["nope"] },
});
defineConfig<User>({
  // @ts-expect-error pattern must be string/RegExp/{value,message}
  name: { type: "text", rules: { pattern: 123 } },
});

// ---- Form props & callbacks
function App() {
  const ref = useFormRef<User>();
  assert<Eq<typeof ref.current, BlueFormRef<User>>>();
  ref.current?.flushChanges();
  ref.current?.setValue("profile.city", "HN");
  // @ts-expect-error bad path on ref methods
  ref.current?.setValue("profile.zip", "x");

  const fail: OnSubmitFailure<User> = (err, values, form) => {
    assert<Eq<typeof err, unknown>>();
    assert<Eq<typeof values, User>>();
    form.reset();
  };

  return (
    <>
      <Form<User>
        ref={ref}
        config={config}
        defaultValues={{ name: "a" }}
        onSubmit={async (values) => { assert<Eq<typeof values, User>>(); }}
        onSubmitFailure={fail}
        onInvalid={(errors) => { errors.name?.message; }}
        onSubmitError={() => {}}
        onFieldChange={(ctx) => { assert<Eq<typeof ctx, FieldChangeContext<User>>>(); }}
        onFormChange={(values) => { values.age.toFixed(); }}
        debounceMs={200}
      />
      {/* inferred TModel from config */}
      <Form config={config} onSubmit={(v) => { v.profile.city.toUpperCase(); }} />
      {/* @ts-expect-error defaultValues must match model */}
      <Form<User> config={config} defaultValues={{ age: "x" }} />
      <Section<{ city: string }> config={defineConfig<{ city: string }>({ city: { type: "text" } })} />
    </>
  );
}

// ---- dynamic config
const rows = [{ key: "a", kind: "text" }];
const dyn: DynamicFormConfig = Object.fromEntries(rows.map((r) => [r.key, { type: r.kind, label: { text: "A" }, rules: { pattern: "^x" } }]));
const dynCfg = defineDynamicConfig(dyn);
const D = () => <Form config={dynCfg} />;

// ---- i18n text (no Register augmentation => any string)
const t1: TranslatableText = "any.key";
const t2: TranslatableText = { text: "literal" };
const t3: TranslatableText = { message: "k", params: { n: 1 } };

// ---- RHF re-exports are the same instance types
const ctx = useFormContext<User>();
const f = useForm<User>();
const refVal: BlueFormRefValue<User> = { ...f, flushChanges: () => {} };

export { App, D, t1, t2, t3, ctx, refVal };
