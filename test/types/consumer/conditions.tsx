// G5: JSON conditions — `when` paths and operator values are checked against
// the model; `from: "root"` paths against the root model, also inline.
import { setupForm, defineMapping, defineDynamicConfig, useField, type Condition } from "react-headless-form";
import type { ReactNode } from "react";

const Text = (_: { placeholder?: string }) => { useField(); return null; };
const Root = ({ children }: { children: ReactNode }) => <form>{children}</form>;
const [Form, defineConfig] = setupForm({ renderRoot: Root, fieldMapping: defineMapping({ text: Text }) });

type Item = { kind: "book" | "other"; qty: number; detail: string };
type Order = {
  role: "admin" | "member";
  age: number;
  name: string;
  locked: boolean;
  status: "draft" | "paid" | "shipped";
  items: Item[];
  address: { city: string };
};

// ---- top level: relative = root model
defineConfig<Order>({
  name: { type: "text", visible: { when: "role", eq: "admin" } },
  age: { type: "text", disabled: { when: "locked", eq: true } },
  locked: { type: "text", visible: { when: "age", gte: 18, lt: 65 } },
  status: { type: "text", required: { when: "name", matches: "^[A-Z]" } },
  role: { type: "text", visible: { when: "address.city", notEmpty: true } },
  address: { type: "text", visible: { or: [{ when: "status", in: ["paid", "shipped"] }, { not: { when: "locked" } }] } },
});

defineConfig<Order>({
  // @ts-expect-error unknown path
  name: { type: "text", visible: { when: "rol", eq: "admin" } },
});
defineConfig<Order>({
  // @ts-expect-error value not in the enum
  name: { type: "text", visible: { when: "role", eq: "guest" } },
});
defineConfig<Order>({
  // @ts-expect-error age is a number
  name: { type: "text", visible: { when: "age", eq: "18" } },
});
defineConfig<Order>({
  // @ts-expect-error numeric comparison on a string field
  name: { type: "text", visible: { when: "name", gt: 1 } },
});
defineConfig<Order>({
  // @ts-expect-error `matches` only for strings
  name: { type: "text", visible: { when: "age", matches: "1" } },
});
defineConfig<Order>({
  // @ts-expect-error `in` values must match the field type
  name: { type: "text", visible: { when: "status", in: ["paid", "lost"] } },
});
defineConfig<Order>({
  // @ts-expect-error errors are found inside and/or/not too
  name: { type: "text", visible: { and: [{ when: "role", eq: "admin" }, { not: { when: "nope" } }] } },
});

// ---- inline nested config: relative paths are untyped (any), root paths are checked
defineConfig<Order>({
  items: {
    type: "array",
    props: {
      config: {
        detail: { type: "text", visible: { when: "kind", eq: "other" } },
        qty: { type: "text", visible: { when: "role", from: "root", eq: "admin" } },
      },
    },
  },
});
defineConfig<Order>({
  items: {
    type: "array",
    props: {
      config: {
        // @ts-expect-error unknown root path, even inline
        qty: { type: "text", visible: { when: "rol", from: "root", eq: "admin" } },
      },
    },
  },
});
defineConfig<Order>({
  items: {
    type: "array",
    props: {
      config: {
        // @ts-expect-error root value type, even inline
        qty: { type: "text", visible: { when: "age", from: "root", eq: "18" } },
      },
    },
  },
});
const InlineInForm = () => (
  <Form<Order>
    config={{
      items: {
        type: "array",
        props: {
          config: {
            // @ts-expect-error root path checked in <Form config> too
            qty: { type: "text", visible: { when: "locked", from: "root", eq: "yes" } },
          },
        },
      },
    }}
  />
);

// ---- separately defined row config with the root model
const itemConfig = defineConfig<Item, Order>({
  detail: { type: "text", visible: { when: "kind", eq: "other" } },
  qty: { type: "text", disabled: { when: "status", from: "root", in: ["paid", "shipped"] } },
});
defineConfig<Item, Order>({
  // @ts-expect-error relative paths are checked against Item
  detail: { type: "text", visible: { when: "role", eq: "admin" } },
});
defineConfig<Item, Order>({
  // @ts-expect-error root paths are checked against Order
  detail: { type: "text", visible: { when: "kind", from: "root", eq: "other" } },
});
const orderConfig = defineConfig<Order>({ items: { type: "array", props: { config: itemConfig } } });

// ---- backward compatible: a row config without a root model nests anywhere
const legacyItemConfig = defineConfig<Item>({ detail: { type: "text" }, kind: { type: "text", visible: { when: "qty", gt: 0 } } });
defineConfig<Order>({ items: { type: "array", props: { config: legacyItemConfig } } });
const Legacy = () => <Form<Order> config={{ items: { type: "array", props: { config: legacyItemConfig } } }} />;

// ---- the Condition type itself
const c1: Condition<Order> = { when: "role", eq: "member" };
// @ts-expect-error
const c2: Condition<Order> = { when: "role", eq: 1 };

// ---- dynamic configs (from a database) are untyped by design
const dyn = defineDynamicConfig(JSON.parse('{"a":{"type":"text","visible":{"when":"b","eq":1}}}'));
const Dyn = () => <Form config={dyn} />;

export { InlineInForm, orderConfig, Legacy, c1, c2, Dyn };
