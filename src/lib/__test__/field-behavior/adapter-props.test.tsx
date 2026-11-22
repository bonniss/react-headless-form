import { render, screen } from "@testing-library/react";
import type { InputHTMLAttributes } from "react";
import { type AdapterProps, defineMapping, setupForm, useField } from "react-headless-form";
import { describe, expect, it } from "vitest";

// An adapter typed with AdapterProps: the input's own props minus what useField() controls
type TextFieldProps = AdapterProps<InputHTMLAttributes<HTMLInputElement>, "id">;

function TextField(props: TextFieldProps) {
  const { id, value, onChange, label } = useField();
  return (
    <label>
      {label}
      <input {...props} id={id} value={value ?? ""} onChange={onChange} />
    </label>
  );
}

const [Form, defineConfig] = setupForm({
  renderRoot: ({ children }) => <form>{children}</form>,
  fieldMapping: defineMapping({ text: TextField }),
});

describe("AdapterProps", () => {
  it("keeps the component's own props in config `props`", () => {
    render(<Form config={{ name: { type: "text", label: "Name", props: { placeholder: "Your name", maxLength: 20 } } }} />);
    expect(screen.getByPlaceholderText("Your name").getAttribute("maxlength")).toBe("20");
  });

  it("rejects props that useField() controls (type-level)", () => {
    defineConfig<{ a: string; b: string; c: string }>({
      // @ts-expect-error `value` comes from the form state, not from props
      a: { type: "text", props: { value: "x" } },
      // @ts-expect-error `label` is a field config key, not a prop
      b: { type: "text", props: { label: "B" } },
      // @ts-expect-error `disabled` is a field config key (boolean or condition)
      c: { type: "text", props: { disabled: true } },
    });
    expect(true).toBe(true);
  });
});
