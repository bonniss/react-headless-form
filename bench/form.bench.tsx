/**
 * Form benchmark: 500 fields, React production build, jsdom.
 *
 *   pnpm bench
 *
 * Compares this branch against react-headless-form 0.14.0 (before the per-field
 * `FieldNode`), plain react-hook-form (controlled via `useController` — the
 * mechanism this library uses — and uncontrolled via `register`) and Formisch.
 * Every library renders the same controlled `<input>`.
 *
 * Rows marked * replace the 49 conditions with 49 values derived from f0
 * (`compute: (v) => v.f0 + "!"`, or useWatch + setValue in plain RHF), so
 * every keystroke in f0 legitimately changes (and re-renders) all 49.
 *
 * Caveats (read before quoting numbers):
 * - jsdom has no layout/paint; compare libraries relative to each other only.
 * - All libraries share one worker process (JIT/GC state carries over).
 * - No validation runs while typing (every library validates on submit only).
 * - Render counts (printed first) do not depend on the machine; times do.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
// NODE_ENV=production is set in vitest.bench.config.ts.
if (process.env.NODE_ENV !== "production") throw new Error("Run with `pnpm bench`.");

import { afterAll, bench, describe } from "vitest";

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { flushSync } = await import("react-dom");
const current = await import("../src/lib/index");
const v014 = await import("react-headless-form-0.14");
const rhf = await import("react-hook-form");
const formisch = await import("@formisch/react");
const v = await import("valibot");

const h = React.createElement;
const N = 500;
const COND_EVERY = 10; // every 10th field is shown only when f0 !== "hide" → 49 conditional fields
const names = Array.from({ length: N }, (_, i) => `f${i}`);
const isCond = (i: number) => i > 0 && i % COND_EVERY === 0;
const showWhen = (x: unknown) => x !== "hide";
const emptyValues = () => Object.fromEntries(names.map((n) => [n, ""]));

let renders = 0;
function Input({ name, value, onChange }: any) {
  renders++;
  return h("input", { "data-n": name, value: value ?? "", onChange });
}

type Lib = { name: string; app: (cond: boolean) => () => any };

type Variant = "fn" | "deps" | "json" | "compute";

// The 49 "conditional" fields as: a visible function, the same with `deps`,
// a JSON condition, or (instead of a condition) a computed value of f0.
const conditional = (variant: Variant) =>
  variant === "json"
    ? { type: "text", visible: { when: "f0", neq: "hide" } }
    : variant === "compute"
      ? { type: "text", readOnly: true, compute: (x: any) => `${x.f0 ?? ""}!` }
      : { type: "text", visible: (x: any) => showWhen(x.f0), ...(variant === "deps" ? { deps: ["f0"] } : {}) };

function headless(label: string, lib: any, variant: Variant): Lib {
  const Text = () => {
    const { path, value, onChange } = lib.useField() as any;
    return h(Input, { name: path, value, onChange: (e: any) => onChange(e.target.value) });
  };
  const [Form] = lib.setupForm({
    renderRoot: ({ children }: any) => h("form", null, children),
    fieldMapping: { text: Text },
  });
  return {
    name: label,
    app: (cond) => {
      const config: any = {};
      names.forEach((n, i) => {
        config[n] =
          cond && isCond(i) ? conditional(variant) : { type: "text" };
      });
      return () => h(Form, { config, defaultValues: emptyValues() });
    },
  };
}

// Plain RHF equivalent of `compute`: watch f0, setValue in an effect.
function plainRhfComputed(): Lib {
  const Controlled = ({ name }: any) => {
    const { field } = rhf.useController({ name });
    return h(Input, { name, value: field.value, onChange: field.onChange });
  };
  const Computed = ({ name }: any) => {
    const { setValue } = rhf.useFormContext();
    const f0 = rhf.useWatch({ name: "f0" });
    React.useEffect(() => {
      setValue(name, `${f0 ?? ""}!`);
    }, [f0, name, setValue]);
    return h(Controlled, { name });
  };
  return {
    name: "RHF, 49 computed (useWatch + setValue)*",
    app: (cond) => () => {
      const methods = rhf.useForm({ defaultValues: emptyValues() });
      return h(
        rhf.FormProvider as any,
        methods,
        h("form", null, names.map((n, i) => h(cond && isCond(i) ? Computed : Controlled, { key: n, name: n }))),
      );
    },
  };
}

function plainRhf(label: string, mode: "controlled" | "register"): Lib {
  const Controlled = ({ name }: any) => {
    const { field } = rhf.useController({ name });
    return h(Input, { name, value: field.value, onChange: field.onChange });
  };
  const Registered = ({ name }: any) => {
    renders++;
    return h("input", { "data-n": name, ...rhf.useFormContext().register(name) });
  };
  const F = mode === "controlled" ? Controlled : Registered;
  const Cond = ({ name }: any) => (showWhen(rhf.useWatch({ name: "f0" })) ? h(F, { name }) : null);
  return {
    name: label,
    app: (cond) => () => {
      const methods = rhf.useForm({ defaultValues: emptyValues() });
      return h(
        rhf.FormProvider as any,
        methods,
        h("form", null, names.map((n, i) => h(cond && isCond(i) ? Cond : F, { key: n, name: n }))),
      );
    },
  };
}

function formischLib(): Lib {
  const schema = v.object(Object.fromEntries(names.map((n) => [n, v.string()])));
  const FField = ({ of, name }: any) =>
    h(formisch.Field as any, { of, path: [name] }, (f: any) =>
      h(Input, { name, value: f.input, onChange: f.props.onChange }),
    );
  const Cond = ({ of, name }: any) => {
    const f0 = formisch.useField(of, { path: ["f0"] });
    return showWhen(f0.input) ? h(FField, { of, name }) : null;
  };
  return {
    name: "Formisch",
    app: (cond) => () => {
      const form = formisch.useForm({ schema, initialInput: emptyValues() } as any);
      return h(
        formisch.Form as any,
        { of: form, onSubmit: () => {} },
        names.map((n, i) => h(cond && isCond(i) ? Cond : FField, { key: n, of: form, name: n })),
      );
    },
  };
}

const libs: Lib[] = [
  headless("react-headless-form (this branch)", current, "fn"),
  headless("this branch, JSON conditions", current, "json"),
  headless("this branch, 49 computed fields*", current, "compute"),
  headless("react-headless-form 0.14.0", v014, "fn"),
  headless("react-headless-form 0.14.0 + deps", v014, "deps"),
  plainRhf("RHF useController", "controlled"),
  plainRhfComputed(),
  plainRhf("RHF register", "register"),
  formischLib(),
];

// --- helpers ---------------------------------------------------------------

const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
function type(name: string, value: string) {
  const el = document.querySelector(`[data-n="${name}"]`) as HTMLInputElement;
  flushSync(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function mount(App: () => any) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  flushSync(() => root.render(h(App)));
  return () => {
    flushSync(() => root.unmount());
    host.remove();
  };
}

type Scenario = { name: string; cond: boolean; field: string; value: (i: number) => string };
const scenarios: Scenario[] = [
  { name: "keystroke in an unrelated field", cond: true, field: `f${N - 1}`, value: (i) => `v${i}` },
  { name: "keystroke in f0, conditions unchanged", cond: true, field: "f0", value: (i) => `v${i}` },
  { name: "f0 toggles 49 conditional fields", cond: true, field: "f0", value: (i) => (i % 2 ? "hide" : `v${i}`) },
];

// --- render counts (machine independent) -------------------------------------

const counts: Record<string, Record<string, number>> = {};
for (const lib of libs) {
  const row: Record<string, number> = {};
  for (const s of scenarios) {
    const unmount = mount(lib.app(s.cond));
    type(s.field, s.value(0)); // settle
    let total = 0;
    for (let i = 1; i <= 20; i++) {
      renders = 0;
      type(s.field, s.value(i));
      total += renders;
    }
    row[s.name] = total / 20;
    unmount();
  }
  counts[lib.name] = row;
}
console.log("\nInputs re-rendered per keystroke (average of 20):");
console.table(counts);

// --- timings ----------------------------------------------------------------

const options = { time: 1500, warmupTime: 300 };

describe(`mount ${N} fields`, () => {
  for (const lib of libs) {
    const App = lib.app(false);
    bench(lib.name, () => mount(App)(), options);
  }
});

for (const s of scenarios) {
  describe(s.name, () => {
    for (const lib of libs) {
      let unmount = () => {};
      let i = 0;
      bench(lib.name, () => type(s.field, s.value(i++)), {
        ...options,
        setup: () => {
          unmount = mount(lib.app(s.cond));
        },
        teardown: () => unmount(),
      });
    }
  });
}

afterAll(() => {
  document.body.innerHTML = "";
});
