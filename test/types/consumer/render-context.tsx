// G5: `render` receives the context of its field type; `useField()` bindings are required.
import { defineMapping, setupForm, useField } from "react-headless-form";

const Text = (_: { placeholder?: string }) => null;
const [, defineConfig] = setupForm({
  renderRoot: ({ children }) => <form>{children}</form>,
  fieldMapping: defineMapping({ text: Text }),
});
const [, defineBaseConfig] = setupForm();

type M = { users: { name: string }[]; addr: { city: string }; note: string };

defineConfig<M>({
  users: {
    type: "array",
    render: ({ append, swap, renderItems, items, idAt }) => (
      <>
        {items.length}
        {idAt(0)}
        <button
          type="button"
          onClick={() => {
            append({ name: "A" });
            swap(0, 1);
          }}
        />
        {renderItems()}
      </>
    ),
    props: {
      config: {
        name: {
          type: "inline",
          render: ({ value, onChange }) => <input value={value} onChange={(e) => onChange(e.target.value)} />,
        },
      },
    },
  },
  addr: { type: "section", render: ({ children }) => <fieldset>{children}</fieldset> },
  note: { type: "text", render: ({ self, label }) => <label>{label}{self}</label> },
});

// works the same without a custom mapping
defineBaseConfig<M>({
  users: { type: "array", render: ({ append, renderItems }) => <>{renderItems()}<b onClick={() => append({ name: "a" })} /></> },
  addr: { type: "section", render: ({ children }) => <i>{children}</i> },
});

defineConfig<M>({
  // @ts-expect-error `self` only exists for mapped field types, not sections
  addr: { type: "section", render: ({ self }) => self },
  // @ts-expect-error array helpers do not exist on a mapped field
  note: { type: "text", render: ({ append }) => append },
});

export function UsesField() {
  const { onChange, onBlur, value } = useField();
  onChange(value);
  onBlur();
  return null;
}
