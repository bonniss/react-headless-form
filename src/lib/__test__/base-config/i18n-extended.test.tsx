import BlueForm from "@/components/form/BlueForm";
import type { TranslatableText } from "@/components/i18n";
import { normalizeTranslator } from "@/components/i18n/resolver";
import { screen } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { renderWithBlueFormProvider } from "../_utils/render-form";

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>{children}</form>
);

const Input = ({
  variant,
  ...props
}: { placeholder?: string; title?: string; variant?: string }) => (
  <input data-testid="input" data-variant={variant} {...props} />
);

describe("i18n – literal text", () => {
  it("returns { text } as-is without calling t", () => {
    const t = vi.fn((key: string) => `t:${key}`);
    const translate = normalizeTranslator(t);
    expect(translate({ text: "Từ CSDL" })).toBe("Từ CSDL");
    expect(t).not.toHaveBeenCalled();
  });

  it("renders literal label next to translated description", () => {
    const t = vi.fn((key: string) => `t:${key}`);
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          name: {
            type: "inline",
            label: { text: "Nhãn thô" },
            description: "form.desc",
            render: ({ label, description }: any) => (
              <span data-testid="out">
                {label}|{description}
              </span>
            ),
          },
        }}
      />,
      { i18nConfig: { t } },
    );

    expect(screen.getByTestId("out").textContent).toBe("Nhãn thô|t:form.desc");
    expect(t).not.toHaveBeenCalledWith("Nhãn thô", undefined);
    expect(t.mock.calls.every(([key]) => key === "form.desc")).toBe(true);
  });

  it("resolves object labels to strings when i18n is disabled", () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          a: {
            type: "inline",
            label: { message: "form.a", fallback: "A" },
            render: ({ label }: any) => <span data-testid="a">{label}</span>,
          },
          b: {
            type: "inline",
            label: { text: "B" },
            render: ({ label }: any) => <span data-testid="b">{label}</span>,
          },
        }}
      />,
      { i18nConfig: { enabled: false, t: (k: string) => `t:${k}` } },
    );

    expect(screen.getByTestId("a").textContent).toBe("form.a");
    expect(screen.getByTestId("b").textContent).toBe("B");
  });
});

describe("i18n – placeholder", () => {
  it("translates the placeholder, and no other prop", () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ input: Input }}
        config={{
          name: {
            type: "input",
            props: { placeholder: "form.ph", title: "form.title", variant: "lg" },
          },
        }}
      />,
      { i18nConfig: { t: (k: string) => `t:${k}` } },
    );
    const input = screen.getByTestId("input");
    expect(input.getAttribute("placeholder")).toBe("t:form.ph");
    expect(input.getAttribute("title")).toBe("form.title");
    expect(input.getAttribute("data-variant")).toBe("lg");
  });

  it("accepts { message, params } and { text } like a label", () => {
    const Raw = (props: { placeholder?: any }) => (
      <span data-testid="raw">{String(props.placeholder)}</span>
    );
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ raw: Raw }}
        config={{
          name: {
            type: "raw",
            props: { placeholder: { message: "form.n", params: { n: 2 } } },
          },
        }}
      />,
      { i18nConfig: { t: (k: string, p?: any) => `t:${k}:${p?.n}` } },
    );
    expect(screen.getByTestId("raw").textContent).toBe("t:form.n:2");
  });

  it("shows a { text } placeholder as is", () => {
    const t = vi.fn((k: string) => `t:${k}`);
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        fieldMapping={{ input: Input }}
        config={{ name: { type: "input", props: { placeholder: { text: "Từ CSDL" } as any } } }}
      />,
      { i18nConfig: { t } },
    );
    expect(screen.getByTestId("input").getAttribute("placeholder")).toBe("Từ CSDL");
    expect(t).not.toHaveBeenCalled();
  });
});

describe("i18n – typed keys", () => {
  it("TranslatableText narrows to the given key union", () => {
    type Keys = "form.name" | "form.email";
    expectTypeOf<"form.name">().toMatchTypeOf<TranslatableText<Keys>>();
    expectTypeOf<{ message: "form.email" }>().toMatchTypeOf<
      TranslatableText<Keys>
    >();
    expectTypeOf<{ text: string }>().toMatchTypeOf<TranslatableText<Keys>>();
    expectTypeOf<"form.typo">().not.toMatchTypeOf<TranslatableText<Keys>>();
    expectTypeOf<{ message: "nope" }>().not.toMatchTypeOf<
      TranslatableText<Keys>
    >();
  });
});
