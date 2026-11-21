import { setupForm, defineMapping } from "react-headless-form";

const Text = (_: { placeholder?: string }) => null;
const [, defineConfig] = setupForm({ fieldMapping: defineMapping({ text: Text }) });
type M = { users: { name: string }[]; addr: { city: string } };

// valid nested configs (inline and via defineConfig<SubModel>)
defineConfig<M>({
  users: {
    type: "array",
    props: {
      config: {
        name: {
          type: "inline",
          render: ({ value, onChange }) => <input value={value} onChange={(e) => onChange?.(e.target.value)} />,
        },
      },
    },
  },
  addr: {
    type: "section",
    props: { nested: true, config: defineConfig<M["addr"]>({ city: { type: "text", props: { placeholder: "x" } } }) },
  },
});

// nested `type` and `props` are checked against the component map
defineConfig<M>({
  users: {
    type: "array",
    props: {
      config: {
        // @ts-expect-error unknown field type inside an array
        name: { type: "textarea" },
      },
    },
  },
  addr: {
    type: "section",
    props: {
      config: {
        // @ts-expect-error wrong props for "text" inside a section
        city: { type: "text", props: { placeholder: 1 } },
      },
    },
  },
});

// model keys inside nested configs are checked with defineConfig<SubModel>()
defineConfig<M["addr"]>({
  // @ts-expect-error unknown key in sub model
  town: { type: "text" },
});
