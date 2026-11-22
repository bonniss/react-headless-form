import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import { defineMapping, setupForm, useField } from "react-headless-form";
import { describe, expect, it } from "vitest";

// setupForm holds what is fixed, a Form passes what changes with the language

function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  const { path, label, value, onChange, errorMessage } = useField();
  return (
    <label>
      {label}
      <input {...props} data-testid={path} value={value ?? ""} onChange={onChange} />
      {errorMessage && <span data-testid={`${path}-error`}>{errorMessage}</span>}
    </label>
  );
}

const dict = {
  en: { name: "Name", hint: "Your name", required: "{field} is required" },
  ja: { name: "名前", hint: "お名前", required: "{field}は必須です" },
};
type Lang = keyof typeof dict;
const translator = (lang: Lang) => (key: string, params?: Record<string, unknown>) =>
  ((dict[lang] as Record<string, string>)[key] ?? key).replace(/\{(\w+)\}/g, (_, p) => String(params?.[p] ?? ""));
const tEn = translator("en");
const tJa = translator("ja");

const [Form] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>
      {children}
      <button type="submit">submit</button>
    </form>
  ),
  fieldMapping: defineMapping({ text: TextField }),
  i18nConfig: { validationTranslation: { required: "required" }, translateProps: ["placeholder"] },
});

const config = {
  name: { type: "text", label: "name", props: { placeholder: "hint" }, rules: { required: true } },
} as const;

describe("i18nConfig: setupForm and Form are merged key by key", () => {
  it("uses setupForm's validationTranslation and translateProps with the Form's t", async () => {
    render(<Form i18nConfig={{ t: tEn }} config={config} />);
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByTestId("name").getAttribute("placeholder")).toBe("Your name");
    await act(async () => {
      fireEvent.click(screen.getByText("submit"));
    });
    expect(screen.getByTestId("name-error").textContent).toBe("Name is required");
  });

  it("translates the shown errors again when the Form's t changes", async () => {
    function Demo() {
      const [t, setT] = useState(() => tEn);
      return (
        <>
          <button type="button" onClick={() => setT(() => tJa)}>
            ja
          </button>
          <Form i18nConfig={{ t }} config={config} />
        </>
      );
    }
    render(<Demo />);
    await act(async () => {
      fireEvent.click(screen.getByText("submit"));
    });
    expect(screen.getByTestId("name-error").textContent).toBe("Name is required");
    await act(async () => {
      fireEvent.click(screen.getByText("ja"));
    });
    await waitFor(() => expect(screen.getByTestId("name-error").textContent).toBe("名前は必須です"));
    expect(screen.getByTestId("name").getAttribute("placeholder")).toBe("お名前");
  });

  it("a key set on the Form, even to undefined, replaces setupForm's", () => {
    render(<Form i18nConfig={{ t: tEn, translateProps: undefined }} config={config} />);
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByTestId("name").getAttribute("placeholder")).toBe("hint");
  });

  it("enabled: false on a Form turns i18n off for that form", () => {
    render(<Form i18nConfig={{ t: tEn, enabled: false }} config={config} />);
    expect(screen.getByText("name")).toBeTruthy();
  });

  it("without a Form i18nConfig, setupForm's applies as before", () => {
    const [Plain] = setupForm({
      renderRoot: ({ children }) => <form>{children}</form>,
      fieldMapping: defineMapping({ text: TextField }),
      i18nConfig: { t: tJa },
    });
    render(<Plain config={config} />);
    expect(screen.getByText("名前")).toBeTruthy();
  });
});
