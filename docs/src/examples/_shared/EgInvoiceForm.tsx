import { useArrayField } from "react-headless-form";
import { Form, defineConfig } from "./form.setup";

type Line = { item: string; qty: string; price: string; total?: number }; // total is computed
type Invoice = { customer: string; lines: Line[]; subtotal: number; vat: number; grandTotal: number };

// Row config with the root model: `scope` is the row, `values` the invoice.
const lineConfig = defineConfig<Line, Invoice>({
  item: { type: "text", label: "Item" },
  qty: { type: "text", label: "Qty" },
  price: { type: "text", label: "Price" },
  total: {
    type: "text",
    label: "Line total",
    readOnly: true,
    compute: (_, { scope }) => (Number(scope.qty) || 0) * (Number(scope.price) || 0),
  },
});

function Lines() {
  const { items, renderItem, append, remove } = useArrayField();
  return (
    <fieldset>
      <legend>Lines</legend>
      {items.map((line, index) => (
        <div key={line.id} className="array-row">
          {renderItem(line, index)}
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ item: "", qty: "1", price: "" })}>
        Add line
      </button>
    </fieldset>
  );
}

const config = defineConfig<Invoice>({
  customer: { type: "text", label: "Customer" },
  lines: { type: "array", render: () => <Lines />, props: { config: lineConfig } },
  // Aggregate of computed row totals
  subtotal: {
    type: "text",
    label: "Subtotal",
    readOnly: true,
    compute: (v) => (v.lines ?? []).reduce((sum, line) => sum + (line.total ?? 0), 0),
  },
  vat: { type: "text", label: "VAT 10%", readOnly: true, compute: (v) => Math.round((v.subtotal ?? 0) * 0.1) },
  grandTotal: {
    type: "text",
    label: "Total",
    readOnly: true,
    compute: (v) => (v.subtotal ?? 0) + (v.vat ?? 0),
  },
});

export default function EgInvoiceForm() {
  return (
    <Form<Invoice>
      config={config}
      defaultValues={{ lines: [{ item: "Coffee", qty: "2", price: "35000" }] }}
    />
  );
}
