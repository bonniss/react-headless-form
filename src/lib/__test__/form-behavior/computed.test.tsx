/**
 * `compute`: derived field values. Organized by real use cases:
 * medical indices (chains), slug (editable field), invoice (array rows +
 * aggregate), nested sections, cycles, and interaction with other features.
 */
import { useArrayField, useField } from "@/components";
import BlueForm from "@/components/form/BlueForm";
import type { BlueFormRef } from "@/types/form";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode, createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------- helpers

const Root = ({ children, onSubmit, formState }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <span data-testid="dirty">{String(formState.isDirty)}</span>
    <span data-testid="dirty-fields">{JSON.stringify(formState.dirtyFields)}</span>
    <button type="submit">submit</button>
  </form>
);

const Text = () => {
  const { path, value, onChange, readOnly, errorMessage } = useField();
  return (
    <>
      <input
        data-testid={path}
        readOnly={readOnly}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {errorMessage && <span data-testid={`${path}-error`}>{errorMessage}</span>}
    </>
  );
};

const Rows = () => {
  const { renderItems, append, remove, move } = useArrayField();
  return (
    <>
      {renderItems()}
      <button type="button" onClick={() => append({ qty: "1", price: "10" })}>
        add
      </button>
      <button type="button" onClick={() => remove(0)}>
        remove-first
      </button>
      <button type="button" onClick={() => move(0, 1)}>
        swap
      </button>
    </>
  );
};

const mapping = { text: Text, array: Rows } as any;

const type = (id: string, value: string) =>
  act(() => {
    fireEvent.change(screen.getByTestId(id), { target: { value } });
  });
const val = (id: string) => (screen.getByTestId(id) as HTMLInputElement).value;
const dirty = () => screen.getByTestId("dirty").textContent;
const submit = async () => {
  await act(async () => {
    fireEvent.click(screen.getByText("submit"));
  });
};

const num = (v: unknown) => (v == null || v === "" ? undefined : Number(v));
const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

// Recipe from the docs: Vietnamese-aware slug.
const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ---------------------------------------------------------------- medical

const bmi = (v: any) => {
  const w = num(v.weight);
  const h = num(v.height);
  return w && h ? round(w / (h / 100) ** 2) : undefined;
};
const bmiClass = (v: any) => {
  const b = num(v.bmi);
  if (b === undefined) return undefined;
  return b < 18.5 ? "underweight" : b < 23 ? "normal" : b < 25 ? "overweight" : "obese";
};
const bsa = (v: any) => {
  const w = num(v.weight);
  const h = num(v.height);
  return w && h ? round(Math.sqrt((w * h) / 3600), 2) : undefined; // Mosteller
};
// CKD-EPI 2021 (race-free)
const egfr = (v: any) => {
  const scr = num(v.creatinine);
  const age = num(v.age);
  if (!scr || !age || !v.sex) return undefined;
  const female = v.sex === "F";
  const k = female ? 0.7 : 0.9;
  const a = female ? -0.241 : -0.302;
  const value =
    142 * Math.min(scr / k, 1) ** a * Math.max(scr / k, 1) ** -1.2 * 0.9938 ** age * (female ? 1.012 : 1);
  return Math.round(value);
};

const medicalConfig = {
  weight: { type: "text" },
  height: { type: "text" },
  age: { type: "text" },
  sex: { type: "text" },
  creatinine: { type: "text" },
  bmi: { type: "text", readOnly: true, compute: bmi },
  bmiClass: { type: "text", readOnly: true, compute: bmiClass },
  alert: {
    type: "text",
    readOnly: true,
    compute: (v: any) => (v.bmiClass === "obese" ? "Refer to nutrition" : ""),
  },
  bsa: { type: "text", readOnly: true, compute: bsa },
  egfr: { type: "text", readOnly: true, compute: egfr },
};

describe("compute: medical indices", () => {
  it("computes BMI from string inputs, with rounding", () => {
    render(<BlueForm renderRoot={Root} fieldMapping={mapping} config={medicalConfig} />);
    expect(val("bmi")).toBe("");
    type("weight", "70");
    expect(val("bmi")).toBe(""); // height missing → undefined
    type("height", "175");
    expect(val("bmi")).toBe("22.9");
    expect(val("bsa")).toBe("1.84");
  });

  it("chains computed values (BMI → class → alert)", () => {
    render(<BlueForm renderRoot={Root} fieldMapping={mapping} config={medicalConfig} />);
    type("height", "170");
    type("weight", "60");
    expect(val("bmiClass")).toBe("normal");
    expect(val("alert")).toBe("");
    type("weight", "95");
    expect(val("bmi")).toBe("32.9");
    expect(val("bmiClass")).toBe("obese");
    expect(val("alert")).toBe("Refer to nutrition");
    type("weight", "");
    expect(val("bmi")).toBe("");
    expect(val("bmiClass")).toBe("");
  });

  it("chains work regardless of config order", () => {
    const { alert, bmiClass: cls, bmi: b, ...inputs } = medicalConfig;
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ weight: "95", height: "170" }}
        config={{ alert, bmiClass: cls, bmi: b, ...inputs }}
      />,
    );
    expect(val("bmi")).toBe("32.9");
    expect(val("bmiClass")).toBe("obese");
    expect(val("alert")).toBe("Refer to nutrition");
  });

  it("eGFR (CKD-EPI 2021) from age, sex and creatinine", () => {
    render(<BlueForm renderRoot={Root} fieldMapping={mapping} config={medicalConfig} />);
    type("age", "50");
    type("sex", "M");
    type("creatinine", "1.0");
    expect(val("egfr")).toBe("92"); // 142 × (1.0/0.9)^-1.2 × 0.9938^50 ≈ 91.7
    type("sex", "F");
    expect(val("egfr")).toBe("69");
  });

  it("computes on mount from defaultValues without making the form dirty", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ weight: "70", height: "175" }}
        config={medicalConfig}
      />,
    );
    expect(val("bmi")).toBe("22.9");
    expect(val("bmiClass")).toBe("normal");
    expect(dirty()).toBe("false");
    type("weight", "71");
    expect(dirty()).toBe("true");
  });

  it("readOnly fields overwrite stale saved values", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ weight: "70", height: "175", bmi: 99 }}
        config={medicalConfig}
      />,
    );
    expect(val("bmi")).toBe("22.9");
  });
});

// ---------------------------------------------------------------- slug

const slugConfig = (readOnly = false) => ({
  title: { type: "text" },
  slug: { type: "text", readOnly, compute: (v: any) => slugify(v.title ?? "") },
});

describe("compute: slug (editable field)", () => {
  it("follows the title, with Vietnamese diacritics", () => {
    render(<BlueForm renderRoot={Root} fieldMapping={mapping} config={slugConfig()} />);
    type("title", "Phở Bò Đặc Biệt");
    expect(val("slug")).toBe("pho-bo-dac-biet");
    type("title", "  Cà phê sữa đá!! ");
    expect(val("slug")).toBe("ca-phe-sua-da");
  });

  it("stops following once the user edits the slug", () => {
    render(<BlueForm renderRoot={Root} fieldMapping={mapping} config={slugConfig()} />);
    type("title", "Hello World");
    type("slug", "custom-slug");
    type("title", "Hello Again");
    expect(val("slug")).toBe("custom-slug");
  });

  it("clearing the slug resumes syncing on the next change", () => {
    render(<BlueForm renderRoot={Root} fieldMapping={mapping} config={slugConfig()} />);
    type("title", "One");
    type("slug", "mine");
    type("slug", "");
    expect(val("slug")).toBe(""); // not refilled while the user is typing
    type("title", "Two");
    expect(val("slug")).toBe("two");
    type("title", "Three");
    expect(val("slug")).toBe("three");
  });

  it("edit form: a saved custom slug is kept", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ title: "My Post", slug: "my-custom-url" }}
        config={slugConfig()}
      />,
    );
    expect(val("slug")).toBe("my-custom-url");
    type("title", "My Post v2");
    expect(val("slug")).toBe("my-custom-url");
  });

  it("edit form: a saved slug equal to the computed one keeps syncing", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ title: "My Post", slug: "my-post" }}
        config={slugConfig()}
      />,
    );
    type("title", "My Post v2");
    expect(val("slug")).toBe("my-post-v2");
  });

  it("same compute, readOnly field: always follows, even over saved data", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ title: "My Post", slug: "my-custom-url" }}
        config={slugConfig(true)}
      />,
    );
    expect(val("slug")).toBe("my-post");
  });

  it("form-level readOnly switched at runtime changes the behavior", () => {
    const Parent = () => {
      const [readOnly, setReadOnly] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setReadOnly(true)}>
            lock
          </button>
          <BlueForm renderRoot={Root} fieldMapping={mapping} readOnly={readOnly} config={slugConfig()} />
        </>
      );
    };
    render(<Parent />);
    type("title", "Alpha");
    type("slug", "edited");
    type("title", "Beta");
    expect(val("slug")).toBe("edited");
    act(() => {
      fireEvent.click(screen.getByText("lock"));
    });
    type("title", "Gamma");
    expect(val("slug")).toBe("gamma");
  });
});

// ---------------------------------------------------------------- invoice

const invoiceConfig = (lineTotal = (_: any, { scope }: any) => (num(scope?.qty) ?? 0) * (num(scope?.price) ?? 0)) => ({
  lines: {
    type: "array",
    props: {
      config: {
        qty: { type: "text" },
        price: { type: "text" },
        total: { type: "text", readOnly: true, compute: lineTotal },
      },
    },
  },
  grandTotal: {
    type: "text",
    readOnly: true,
    compute: (v: any) => (v.lines ?? []).reduce((sum: number, l: any) => sum + (num(l.total) ?? 0), 0),
  },
});

describe("compute: invoice (array rows + aggregate)", () => {
  it("row totals and the grand total, on mount and on change", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ lines: [{ qty: "2", price: "5" }, { qty: "1", price: "7" }] }}
        config={invoiceConfig()}
      />,
    );
    expect(val("lines.0.total")).toBe("10");
    expect(val("lines.1.total")).toBe("7");
    expect(val("grandTotal")).toBe("17");
    type("lines.1.qty", "3");
    expect(val("lines.1.total")).toBe("21");
    expect(val("grandTotal")).toBe("31");
    expect(dirty()).toBe("true");
  });

  it("append / remove / move recompute", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ lines: [{ qty: "2", price: "5" }, { qty: "1", price: "7" }] }}
        config={invoiceConfig()}
      />,
    );
    act(() => {
      fireEvent.click(screen.getByText("add"));
    });
    expect(val("lines.2.total")).toBe("10");
    expect(val("grandTotal")).toBe("27");
    act(() => {
      fireEvent.click(screen.getByText("remove-first"));
    });
    expect(val("grandTotal")).toBe("17");
    act(() => {
      fireEvent.click(screen.getByText("swap"));
    });
    expect(val("lines.0.total")).toBe("10");
    expect(val("lines.1.total")).toBe("7");
    expect(val("grandTotal")).toBe("17");
  });

  it("typing in one row recomputes only that row's total (and the aggregate)", () => {
    const lineTotal = vi.fn((_: any, { scope }: any) => (num(scope?.qty) ?? 0) * (num(scope?.price) ?? 0));
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ lines: [{ qty: "1", price: "1" }, { qty: "1", price: "1" }, { qty: "1", price: "1" }] }}
        config={invoiceConfig(lineTotal)}
      />,
    );
    lineTotal.mockClear();
    type("lines.1.price", "4");
    const paths = lineTotal.mock.calls.map(([, ctx]) => ctx.path);
    expect(new Set(paths)).toEqual(new Set(["lines.1.total"]));
    expect(val("grandTotal")).toBe("6");
  });
});

// ---------------------------------------------------------------- scope / root

describe("compute: nested sections and root values", () => {
  it("uses ctx.scope in a nested section and root values via `values`", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          currency: { type: "text" },
          person: {
            type: "section",
            props: {
              nested: true,
              config: {
                first: { type: "text" },
                last: { type: "text" },
                full: {
                  type: "text",
                  readOnly: true,
                  compute: (v: any, { scope }: any) =>
                    [scope?.first, scope?.last].filter(Boolean).join(" ") + (v.currency ? ` (${v.currency})` : ""),
                },
              },
            },
          },
        }}
      />,
    );
    type("person.first", "Ada");
    type("person.last", "Lovelace");
    expect(val("person.full")).toBe("Ada Lovelace");
    type("currency", "VND");
    expect(val("person.full")).toBe("Ada Lovelace (VND)");
  });
});

// ---------------------------------------------------------------- cycles

describe("compute: cycles", () => {
  it("stops an oscillating cycle and reports the paths", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          seed: { type: "text" },
          a: { type: "text", readOnly: true, compute: (v: any) => (num(v.b) ?? 0) + (num(v.seed) ?? 0) + 1 },
          b: { type: "text", readOnly: true, compute: (v: any) => (num(v.a) ?? 0) + 1 },
        }}
      />,
    );
    type("seed", "1");
    expect(error.mock.calls.some(([m]) => /`compute` cycle detected/.test(String(m)) && /a → b|b → a/.test(String(m)))).toBe(true);
    error.mockRestore();
  });

  it("mutually dependent but converging computes do not report a cycle", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          celsius: { type: "text" },
          kelvin: { type: "text", readOnly: true, compute: (v: any) => (num(v.celsius) === undefined ? undefined : num(v.celsius)! + 273) },
          check: { type: "text", readOnly: true, compute: (v: any) => (num(v.kelvin) === undefined ? undefined : num(v.kelvin)! - 273) },
        }}
      />,
    );
    type("celsius", "20");
    expect(val("kelvin")).toBe("293");
    expect(val("check")).toBe("20");
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("returning a new object / array each time does not loop", () => {
    const compute = vi.fn((v: any) => ({ tags: String(v.text ?? "").split(",").filter(Boolean) }));
    const ref = createRef<BlueFormRef<any>>();
    render(
      <BlueForm
        ref={ref}
        renderRoot={Root}
        fieldMapping={{ ...mapping, json: () => null }}
        config={{ text: { type: "text" }, parsed: { type: "json", readOnly: true, compute } }}
      />,
    );
    type("text", "a,b");
    expect(ref.current!.getValues("parsed")).toEqual({ tags: ["a", "b"] });
    const calls = compute.mock.calls.length;
    type("text", "a,b");
    expect(compute.mock.calls.length).toBeLessThanOrEqual(calls + 2);
  });
});

// ---------------------------------------------------------------- interplay

describe("compute: interplay with other features", () => {
  it("recomputes after reset() and leaves the form pristine", () => {
    const ref = createRef<BlueFormRef<any>>();
    // reset() notifies without a field name; conditions and computes must re-run.
    render(<BlueForm ref={ref} renderRoot={Root} fieldMapping={mapping} config={medicalConfig} />);
    type("weight", "70");
    type("height", "175");
    // All inputs are reset (a partial reset() leaves plain RHF dirty too);
    // the computed fields are not passed and must not make the form dirty.
    act(() => ref.current!.reset({ weight: "80", height: "180", age: "", sex: "", creatinine: "" }));
    expect(val("bmi")).toBe("24.7");
    expect(dirty()).toBe("false");
  });

  it("a hidden computed field stays current and is submitted", async () => {
    const onSubmit = vi.fn();
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        onSubmit={onSubmit}
        config={{
          title: { type: "text" },
          slug: { type: "text", visible: false, compute: (v: any) => slugify(v.title ?? "") },
        }}
      />,
    );
    type("title", "Hidden Slug");
    await submit();
    expect(onSubmit.mock.calls[0][0]).toEqual({ title: "Hidden Slug", slug: "hidden-slug" });
  });

  it("declared deps override inference", () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        config={{
          a: { type: "text" },
          b: { type: "text" },
          sum: { type: "text", readOnly: true, deps: ["a"], compute: (v: any) => (num(v.a) ?? 0) + (num(v.b) ?? 0) },
        }}
      />,
    );
    type("b", "5");
    expect(val("sum")).toBe("0"); // b is not a declared dep
    type("a", "1");
    expect(val("sum")).toBe("6");
  });

  it("rules on a computed field validate after submit", async () => {
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        defaultValues={{ weight: "70", height: "175" }}
        config={{
          ...medicalConfig,
          bmi: { ...medicalConfig.bmi, rules: { max: { value: 40, message: "BMI too high" } } },
        }}
      />,
    );
    await submit();
    expect(screen.queryByTestId("bmi-error")).toBeNull();
    type("weight", "150");
    await waitFor(() => expect(screen.getByTestId("bmi-error").textContent).toBe("BMI too high"));
    type("weight", "70");
    await waitFor(() => expect(screen.queryByTestId("bmi-error")).toBeNull());
  });

  it("onFieldChange reports computed changes", () => {
    const onFieldChange = vi.fn();
    render(
      <BlueForm renderRoot={Root} fieldMapping={mapping} onFieldChange={onFieldChange} config={slugConfig()} />,
    );
    type("title", "News");
    expect(onFieldChange.mock.calls.map(([ctx]) => [ctx.name, ctx.value])).toContainEqual(["slug", "news"]);
  });

  it("works under StrictMode", () => {
    render(
      <StrictMode>
        <BlueForm renderRoot={Root} fieldMapping={mapping} defaultValues={{ weight: "70", height: "175" }} config={medicalConfig} />
      </StrictMode>,
    );
    expect(val("bmi")).toBe("22.9");
    type("height", "180");
    expect(val("bmi")).toBe("21.6");
  });

  it("schema output contains computed values", async () => {
    const onSubmit = vi.fn();
    render(
      <BlueForm
        renderRoot={Root}
        fieldMapping={mapping}
        schema={z.object({ title: z.string(), slug: z.string().min(1) }) as any}
        onSubmit={onSubmit}
        config={slugConfig()}
      />,
    );
    type("title", "Schema Post");
    await submit();
    expect(onSubmit.mock.calls[0][0]).toEqual({ title: "Schema Post", slug: "schema-post" });
  });
});
