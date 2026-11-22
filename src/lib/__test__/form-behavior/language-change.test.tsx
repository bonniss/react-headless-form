import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { defineMapping, setupForm, useArrayField, useField } from "react-headless-form";
import { describe, expect, it } from "vitest";

function TextField() {
  const { path, label, value, onChange, errorMessage } = useField();
  return (
    <label>
      {label}
      <input data-testid={path} value={value ?? ""} onChange={onChange} />
      {errorMessage && <span data-testid={`${path}-error`}>{errorMessage}</span>}
    </label>
  );
}

function Rows() {
  const { items, renderItem, append, errorMessage } = useArrayField();
  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id}>{renderItem(item, i)}</div>
      ))}
      {errorMessage && <span data-testid="rows-error">{errorMessage}</span>}
      <button type="button" onClick={() => append({ name: "x" })}>
        add
      </button>
    </div>
  );
}

const [Form] = setupForm({
  renderRoot: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>
      {children}
      <button type="submit">submit</button>
    </form>
  ),
  fieldMapping: defineMapping({ text: TextField, array: Rows }),
});

const dict = {
  en: { name: "Name", rows: "Rows", required: "{field} is required", maxLength: "{field}: at most {maxLength}", unit: "kg" },
  ja: { name: "名前", rows: "行", required: "{field}は必須です", maxLength: "{field}は最大{maxLength}件", unit: "キロ" },
};
type Lang = keyof typeof dict;
const translator = (lang: Lang) => (key: string, params?: Record<string, unknown>) =>
  ((dict[lang] as Record<string, string>)[key] ?? key).replace(/\{(\w+)\}/g, (_, p) => String(params?.[p] ?? ""));

type Model = { name: string; rows: { name: string }[]; weight: string; weightText?: string };

function Demo() {
  const [lang, setLang] = useState<Lang>("en");
  const t = translator(lang);
  return (
    <>
      <button type="button" onClick={() => setLang("ja")}>
        ja
      </button>
      <Form<Model>
        i18nConfig={{ t, validationTranslation: { required: "required", maxLength: "maxLength" } }}
        defaultValues={{ weight: "70", rows: [] }}
        config={{
          name: { type: "text", label: "name", rules: { required: true } },
          rows: { type: "array", label: "rows", rules: { maxLength: 1 }, props: { config: { name: { type: "text" } } } },
          // closes over `t`: a new function per language
          weightText: { type: "text", readOnly: true, compute: (v) => `${v.weight} ${t("unit")}` },
          weight: { type: "text" },
        }}
      />
    </>
  );
}

describe("language change", () => {
  it("translates the error messages already shown (field and array errors)", async () => {
    render(<Demo />);
    act(() => {
      fireEvent.click(screen.getByText("add"));
    });
    act(() => {
      fireEvent.click(screen.getByText("add"));
    });
    await act(async () => {
      fireEvent.click(screen.getByText("submit"));
    });
    expect(screen.getByTestId("name-error").textContent).toBe("Name is required");
    await waitFor(() => expect(screen.getByTestId("rows-error").textContent).toBe("Rows: at most 1"));

    await act(async () => {
      fireEvent.click(screen.getByText("ja"));
    });
    await waitFor(() => expect(screen.getByTestId("name-error").textContent).toBe("名前は必須です"));
    await waitFor(() => expect(screen.getByTestId("rows-error").textContent).toBe("行は最大1件"));
  });

  it("runs a compute again when its function changes", async () => {
    render(<Demo />);
    expect((screen.getByTestId("weightText") as HTMLInputElement).value).toBe("70 kg");
    await act(async () => {
      fireEvent.click(screen.getByText("ja"));
    });
    expect((screen.getByTestId("weightText") as HTMLInputElement).value).toBe("70 キロ");
    act(() => {
      fireEvent.change(screen.getByTestId("weight"), { target: { value: "80" } });
    });
    expect((screen.getByTestId("weightText") as HTMLInputElement).value).toBe("80 キロ");
  });

  it("does not validate untouched fields on a language change", async () => {
    render(<Demo />);
    await act(async () => {
      fireEvent.click(screen.getByText("ja"));
    });
    expect(screen.queryByTestId("name-error")).toBeNull();
  });
});

describe("custom messages go through t", () => {
  const messages: Record<string, Record<string, string>> = {
    en: { "code.invalid": "Invalid code", "email.taken": "Email is taken" },
    ja: { "code.invalid": "コードが無効です", "email.taken": "このメールは使用済みです" },
  };
  type Custom = { code: string; email: string; nick: string };

  function CustomDemo({ formRef }: { formRef: { current: any } }) {
    const [lang, setLang] = useState("en");
    // falls back to the key, like i18next
    const t = (key: string) => messages[lang][key] ?? key;
    return (
      <>
        <button type="button" onClick={() => setLang("ja")}>
          ja
        </button>
        <Form<Custom>
          ref={formRef}
          i18nConfig={{ t }}
          defaultValues={{ code: "", email: "a@b.c", nick: "" }}
          config={{
            code: { type: "text", rules: { validate: (v) => v === "ok" || "code.invalid" } },
            email: { type: "text" },
            nick: { type: "text", rules: { required: "Nickname, please" } },
          }}
        />
      </>
    );
  }

  it("translates validate() keys and setError() keys, keeps plain text, and never clears setError() errors", async () => {
    const formRef = { current: null as any };
    render(<CustomDemo formRef={formRef} />);
    await act(async () => {
      formRef.current.setError("email", { type: "server", message: "email.taken" });
      await formRef.current.trigger(["code", "nick"]);
    });
    expect(screen.getByTestId("code-error").textContent).toBe("Invalid code");
    expect(screen.getByTestId("email-error").textContent).toBe("Email is taken");
    expect(screen.getByTestId("nick-error").textContent).toBe("Nickname, please");

    await act(async () => {
      fireEvent.click(screen.getByText("ja"));
    });
    await waitFor(() => expect(screen.getByTestId("code-error").textContent).toBe("コードが無効です"));
    // a server error survives the language switch, translated
    expect(screen.getByTestId("email-error").textContent).toBe("このメールは使用済みです");
    expect(screen.getByTestId("nick-error").textContent).toBe("Nickname, please");
  });
});
