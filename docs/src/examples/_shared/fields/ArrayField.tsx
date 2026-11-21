import { useArrayField } from "react-headless-form";

/** A generic `array` renderer, so array fields can come from plain JSON configs. */
export default function ArrayField() {
  const { label, items, renderItem, append, remove, errorMessage } = useArrayField();
  return (
    <fieldset>
      <legend>{label}</legend>
      {items.map((item, index) => (
        <div key={item.id} className="array-row">
          {renderItem(item, index)}
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({})}>
        Add
      </button>
      {errorMessage && <div className="fieldError">{errorMessage}</div>}
    </fieldset>
  );
}
