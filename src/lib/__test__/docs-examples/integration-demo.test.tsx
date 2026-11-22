/**
 * The integration demos (docs/integrations) share one config and one demo
 * stage; only the UI adapters differ per library. This runs that shared
 * logic with plain HTML adapters, so CI covers it without the UI libraries.
 */
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import type { Root } from "react-dom/client";
import { useArrayField, useField } from "react-headless-form";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mountDemo } from "../../../../docs/integrations/shared/mount";
import type { Translator } from "../../../../docs/integrations/shared/i18n";
import {
  type Profile,
  logic,
  roleOptions,
  themeOptions,
} from "../../../../docs/integrations/shared/logic";
import { setupDemo } from "../../../../docs/integrations/shared/setup";
import type { Shells } from "../../../../docs/integrations/shared/types";

type InputProps = Omit<ComponentProps<"input">, "value" | "onChange">;

function Control(props: InputProps) {
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

function SelectControl(props: Omit<ComponentProps<"select">, "value" | "onChange">) {
  const { path, value, onChange } = useField();
  return <select {...props} data-testid={path} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

function CheckboxControl(props: Omit<InputProps, "type" | "checked">) {
  const { path, value, onChange } = useField();
  return (
    <input
      {...props}
      type="checkbox"
      data-testid={path}
      checked={Boolean(value)}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

const fields = { text: Control, longText: Control, select: SelectControl, checkbox: CheckboxControl };

const shells: Shells = {
  Root: ({ id, children, onSubmit }) => (
    <form id={id} onSubmit={onSubmit} noValidate>
      {children}
    </form>
  ),
  SubmitButton: ({ form, children }) => (
    <button type="submit" form={form} data-testid="header-submit">
      {children}
    </button>
  ),
  LanguageSwitch: ({ value, options, onChange }) => (
    <>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </>
  ),
  Section: ({ title, children }) => (
    <fieldset>
      <legend>{title}</legend>
      {children}
    </fieldset>
  ),
  LinesList: () => {
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
        {errorMessage && <span data-testid="lines-error">{errorMessage}</span>}
        <button type="button" onClick={() => append({ item: "", qty: "1", price: "" })}>
          add-line
        </button>
      </div>
    );
  },
};

// The same logic as every library demo; only `type` and the plain-HTML props differ.
const [Form, defineConfig] = setupDemo(fields, shells);
const options = (list: { value: string; label: string }[]) =>
  list.map((o) => (
    <option key={o.value} value={o.value}>
      {o.label}
    </option>
  ));
const buildConfig = (t: Translator) =>
  defineConfig<Profile>({
    name: { type: "text", ...logic.name },
    slug: { type: "text", ...logic.slug },
    email: { type: "text", ...logic.email, props: { type: "email" } },
    role: { type: "select", ...logic.role, props: { children: options(roleOptions(t)) } },
    adminCode: { type: "text", ...logic.adminCode },
    bio: { type: "longText", ...logic.bio },
    health: {
      type: "section",
      ...logic.health,
      render: ({ label, children }) => <shells.Section title={label}>{children}</shells.Section>,
      props: {
        nested: true,
        config: {
          weight: { type: "text", ...logic.weight },
          height: { type: "text", ...logic.height },
          bmi: { type: "text", ...logic.bmi },
          bmiClass: { type: "text", ...logic.bmiClass },
        },
      },
    },
    settings: {
      type: "section",
      ...logic.settings,
      render: ({ label, children }) => <shells.Section title={label}>{children}</shells.Section>,
      props: {
        nested: true,
        config: {
          newsletter: { type: "checkbox", ...logic.newsletter },
          theme: { type: "select", ...logic.theme, props: { children: options(themeOptions(t)) } },
        },
      },
    },
    lines: {
      type: "array",
      ...logic.lines,
      render: () => <shells.LinesList />,
      props: {
        config: {
          item: { type: "text", ...logic.item },
          qty: { type: "text", ...logic.qty },
          price: { type: "text", ...logic.price },
          total: { type: "text", ...logic.total },
        },
      },
    },
    subtotal: { type: "text", ...logic.subtotal },
    vat: { type: "text", ...logic.vat },
    grandTotal: { type: "text", ...logic.grandTotal },
  });

let root: Root;
beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
  act(() => {
    root = mountDemo({ Form, buildConfig }, shells);
  });
});
afterEach(() => act(() => root.unmount()));

const input = (path: string) => screen.getByTestId(path) as HTMLInputElement;
const type = (path: string, value: string) =>
  act(() => {
    fireEvent.change(input(path), { target: { value } });
  });
const submit = async () => {
  await act(async () => {
    fireEvent.click(screen.getByTestId("header-submit"));
  });
};

describe("integration demo: shared logic", () => {
  it("computes slug, BMI chain and invoice totals", () => {
    type("name", "Phở Bò");
    expect(input("slug").value).toBe("pho-bo");
    type("slug", "custom");
    type("name", "Bún Chả");
    expect(input("slug").value).toBe("custom");

    type("health.weight", "70");
    type("health.height", "175");
    expect(input("health.bmi").value).toBe("22.9");
    expect(input("health.bmiClass").value).toBe("normal");

    // default line: 2 × 35000
    expect(input("lines.0.total").value).toBe("70000");
    expect(input("subtotal").value).toBe("70000");
    expect(input("vat").value).toBe("7000");
    expect(input("grandTotal").value).toBe("77000");
    act(() => {
      fireEvent.click(screen.getByText("add-line"));
    });
    type("lines.1.price", "10000");
    expect(input("subtotal").value).toBe("80000");
    act(() => {
      fireEvent.click(screen.getByText("remove-0"));
    });
    expect(input("grandTotal").value).toBe("11000");
  });

  it("JSON conditions: bio disabled for viewers, adminCode only for admins", () => {
    expect(input("bio").disabled).toBe(true);
    expect(screen.queryByTestId("adminCode")).toBeNull();
    act(() => {
      fireEvent.change(screen.getByTestId("role"), { target: { value: "admin" } });
    });
    expect(input("bio").disabled).toBe(false);
    expect(screen.getByTestId("adminCode")).toBeTruthy();
  });

  it("errors land on the exact row; the header lists them by path", async () => {
    act(() => {
      fireEvent.click(screen.getByText("add-line"));
    });
    await submit();
    expect(screen.getByTestId("name-error").textContent).toBe("Name is required");
    expect(screen.getByTestId("lines.1.item-error").textContent).toBe("Item is required");
    expect(screen.getByTestId("lines.1.price-error").textContent).toBe("Price is required");
    expect(screen.queryByTestId("lines.0.item-error")).toBeNull();
    await waitFor(() => screen.getByTestId("error-list"));
    const list = screen.getByTestId("error-list").textContent ?? "";
    expect(list).toContain("lines.1.price");
    expect(screen.getByTestId("status-errors").textContent).toContain("3 errors");
  });

  it("limits the array to 3 lines with a translated array-level error", async () => {
    for (let i = 0; i < 3; i++) {
      act(() => {
        fireEvent.click(screen.getByText("add-line"));
      });
    }
    await submit();
    await waitFor(() => expect(screen.getByTestId("lines-error").textContent).toBe("Invoice lines: at most 3"));
  });

  it("switching language translates labels and errors already shown", async () => {
    await submit();
    expect(screen.getByTestId("name-error").textContent).toBe("Name is required");
    await act(async () => {
      fireEvent.click(screen.getByText("日本語"));
    });
    await waitFor(() => expect(screen.getByTestId("name-error").textContent).toBe("名前は必須です"));
    expect(screen.getByText("健康診断")).toBeTruthy();
  });

  it("a valid submit opens the payload drawer with computed values tagged; hidden fields are left out", async () => {
    type("name", "Ann");
    await submit();
    await waitFor(() => screen.getByTestId("payload-drawer"));
    const drawer = screen.getByTestId("payload-drawer");
    expect(drawer.textContent).toContain("grandTotal");
    expect(drawer.textContent).toContain("computed");
    expect(drawer.textContent).toContain("adminCode"); // listed as not submitted
    expect(screen.getByTestId("status-ok")).toBeTruthy();
  });
});
