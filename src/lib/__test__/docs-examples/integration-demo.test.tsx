/**
 * The integration demos (docs/integrations) are one form written for each UI
 * library. This runs the same config with plain HTML adapters inside the demo
 * stage, so CI covers the form logic without the UI libraries.
 */
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import type { Root } from "react-dom/client";
import { defineMapping, setupForm, useArrayField, useField } from "react-headless-form";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type Translator, useT } from "../../../../docs/integrations/shared/i18n";
import { FORM_ID, mountDemo } from "../../../../docs/integrations/shared/mount";

type InputProps = Omit<ComponentProps<"input">, "value" | "onChange">;

function Text(props: InputProps) {
  const { path, label, value, onChange, disabled, readOnly, errorMessage } = useField();
  return (
    <label>
      {label}
      <input
        {...props}
        data-testid={path}
        value={value ?? ""}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
      />
      {errorMessage && <span data-testid={`${path}-error`}>{errorMessage}</span>}
    </label>
  );
}

function Select(props: Omit<ComponentProps<"select">, "value" | "onChange">) {
  const { path, value, onChange } = useField();
  return <select {...props} data-testid={path} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

function Checkbox() {
  const { path, value, onChange } = useField();
  return (
    <input type="checkbox" data-testid={path} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
  );
}

function Guests() {
  const { items, renderItem, append, remove, errorMessage } = useArrayField();
  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id}>
          {renderItem(item, index)}
          <button type="button" onClick={() => remove(index)}>
            remove-{index}
          </button>
        </div>
      ))}
      {errorMessage && <span data-testid="guests-error">{errorMessage}</span>}
      <button type="button" onClick={() => append({ name: "" })}>
        add-guest
      </button>
    </div>
  );
}

function FormRoot({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) {
  const t = useT();
  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate>
      <h2>{t("title")}</h2>
      {children}
    </form>
  );
}

type Registration = {
  name: string;
  email: string;
  ticket: "standard" | "student";
  studentId?: string;
  promoCode?: string;
  guests: { name: string }[];
  invoice: boolean;
  billing?: { company: string; taxId?: string };
  total?: number;
};

const PRICE = { standard: 100, student: 50, guest: 100 };
const [Form, defineConfig] = setupForm({
  renderRoot: ({ children, onSubmit }) => <FormRoot onSubmit={onSubmit}>{children}</FormRoot>,
  fieldMapping: defineMapping({ text: Text, select: Select, checkbox: Checkbox }),
});

// Same config as docs/integrations/<lib>/form.tsx, with plain HTML props
const buildConfig = (t: Translator) =>
  defineConfig<Registration>({
    name: { type: "text", label: "field.name", rules: { required: true } },
    email: {
      type: "text",
      label: "field.email",
      rules: { required: true, pattern: "^\\S+@\\S+\\.\\S+$" },
      props: { type: "email", placeholder: "hint.email" },
    },
    ticket: {
      type: "select",
      label: "field.ticket",
      props: {
        children: [
          <option key="standard" value="standard">
            {t("ticket.standard")}
          </option>,
          <option key="student" value="student">
            {t("ticket.student")}
          </option>,
        ],
      },
    },
    studentId: {
      type: "text",
      label: "field.studentId",
      visible: { when: "ticket", eq: "student" },
      rules: { required: true },
    },
    promoCode: { type: "text", label: "field.promoCode", disabled: { when: "ticket", eq: "student" } },
    guests: {
      type: "array",
      label: "field.guests",
      rules: { maxLength: 3 },
      render: () => <Guests />,
      props: { config: { name: { type: "text", label: "field.guestName", rules: { required: true } } } },
    },
    invoice: { type: "checkbox", label: "field.invoice" },
    billing: {
      type: "section",
      label: "field.billing",
      visible: { when: "invoice", eq: true },
      props: {
        nested: true,
        config: {
          company: { type: "text", label: "field.company", rules: { required: true } },
          taxId: { type: "text", label: "field.taxId" },
        },
      },
    },
    total: {
      type: "text",
      label: "field.total",
      readOnly: true,
      compute: (v) => PRICE[v.ticket ?? "standard"] + PRICE.guest * (v.guests?.length ?? 0),
    },
  });

const defaultValues: Partial<Registration> = { ticket: "standard", guests: [], invoice: false };

let root: Root;
beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
  act(() => {
    root = mountDemo(
      { Form, buildConfig, defaultValues },
      {
        SubmitButton: ({ form, children }) => (
          <button type="submit" form={form} data-testid="header-submit">
            {children}
          </button>
        ),
        LanguageSwitch: ({ options, onChange }) => (
          <>
            {options.map((o) => (
              <button key={o.value} type="button" onClick={() => onChange(o.value)}>
                {o.label}
              </button>
            ))}
          </>
        ),
      },
    );
  });
});
afterEach(() => act(() => root.unmount()));

const input = (path: string) => screen.getByTestId(path) as HTMLInputElement;
const type = (path: string, value: string) =>
  act(() => {
    fireEvent.change(input(path), { target: { value } });
  });
const click = (text: string) =>
  act(() => {
    fireEvent.click(screen.getByText(text));
  });
const submit = () =>
  act(async () => {
    fireEvent.click(screen.getByTestId("header-submit"));
  });

describe("integration demo: registration form", () => {
  it("renders the title from renderRoot and a translated placeholder", () => {
    expect(screen.getByText("Conference registration")).toBeTruthy();
    expect(input("email").placeholder).toBe("you@company.com");
  });

  it("student ticket: shows studentId, disables promoCode, updates the total", () => {
    expect(screen.queryByTestId("studentId")).toBeNull();
    expect(input("total").value).toBe("100");
    act(() => {
      fireEvent.change(screen.getByTestId("ticket"), { target: { value: "student" } });
    });
    expect(screen.getByTestId("studentId")).toBeTruthy();
    expect(input("promoCode").disabled).toBe(true);
    expect(input("total").value).toBe("50");
    click("add-guest");
    expect(input("total").value).toBe("150");
  });

  it("guest errors land on the exact row; more than 3 guests is an array error", async () => {
    click("add-guest");
    click("add-guest");
    type("guests.0.name", "Ann");
    await submit();
    expect(screen.queryByTestId("guests.0.name-error")).toBeNull();
    expect(screen.getByTestId("guests.1.name-error").textContent).toBe("Guest name is required");
    await waitFor(() => expect(screen.getByTestId("error-list").textContent).toContain("guests.1.name"));
    click("add-guest");
    click("add-guest");
    await submit();
    await waitFor(() => expect(screen.getByTestId("guests-error").textContent).toBe("Guests: at most 3"));
  });

  it("invoice shows the nested billing section with its own rules", async () => {
    expect(screen.queryByTestId("billing.company")).toBeNull();
    act(() => {
      fireEvent.click(screen.getByTestId("invoice"));
    });
    await submit();
    expect(screen.getByTestId("billing.company-error").textContent).toBe("Company is required");
  });

  it("switching language translates the title and errors already shown", async () => {
    await submit();
    expect(screen.getByTestId("name-error").textContent).toBe("Full name is required");
    await act(async () => {
      fireEvent.click(screen.getByText("日本語"));
    });
    await waitFor(() => expect(screen.getByTestId("name-error").textContent).toBe("氏名は必須です"));
    expect(screen.getByText("カンファレンス参加登録")).toBeTruthy();
  });

  it("a valid submit opens the payload drawer; hidden fields are left out", async () => {
    type("name", "Ann");
    type("email", "ann@example.com");
    await submit();
    await waitFor(() => screen.getByTestId("payload-drawer"));
    const drawer = screen.getByTestId("payload-drawer").textContent ?? "";
    expect(drawer).toContain("total");
    expect(drawer).toContain("computed");
    expect(drawer).toContain("studentId"); // listed as not submitted
  });
});
