import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EgComputableForm from "../../../../docs/src/examples/_shared/EgComputableForm";
import EgInvoiceForm from "../../../../docs/src/examples/_shared/EgInvoiceForm";
import EgMedicalForm from "../../../../docs/src/examples/_shared/EgMedicalForm";
import EgSlugForm, { slugify } from "../../../../docs/src/examples/_shared/EgSlugForm";

const input = (label: string) => screen.getByPlaceholderText(label) as HTMLInputElement;
const fill = (label: string, value: string) =>
  act(() => {
    fireEvent.change(input(label), { target: { value } });
  });

describe("docs: EgComputableForm", () => {
  it("full name → initials, and BMI", () => {
    render(<EgComputableForm />);
    fill("First name", "ada");
    fill("Last name", "lovelace");
    expect(input("Full name").value).toBe("ada lovelace");
    expect(input("Initials").value).toBe("AL");
    fill("Weight (kg)", "60");
    fill("Height (cm)", "165");
    expect(input("BMI").value).toBe("22");
  });
});

describe("docs: EgSlugForm", () => {
  it("slugify recipe", () => {
    expect(slugify("Phở Bò Đặc Biệt")).toBe("pho-bo-dac-biet");
    expect(slugify("  Cà phê -- sữa đá!! ")).toBe("ca-phe-sua-da");
    expect(slugify("Ăn uống & Giải trí 2026")).toBe("an-uong-giai-tri-2026");
    expect(slugify("")).toBe("");
  });

  it("follows the title until edited; saved custom slugs are kept", () => {
    render(<EgSlugForm />);
    fill("Title", "Bún Chả Hà Nội");
    expect(input("Slug").value).toBe("bun-cha-ha-noi");
    fill("Slug", "bun-cha");
    fill("Title", "Bún Chả Hà Nội ngon");
    expect(input("Slug").value).toBe("bun-cha");

    act(() => {
      fireEvent.click(screen.getByText("Load saved post"));
    });
    expect(input("Slug").value).toBe("pho-bo-ha-noi");
    fill("Title", "Phở Bò");
    expect(input("Slug").value).toBe("pho-bo-ha-noi");
  });
});

describe("docs: EgMedicalForm", () => {
  it("computes the indices and the chained alert", () => {
    render(<EgMedicalForm />);
    act(() => {
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "M" } });
    });
    fill("Age", "70");
    fill("Weight (kg)", "95");
    fill("Height (cm)", "170");
    fill("Serum creatinine (mg/dL)", "1.6");
    expect(input("BMI").value).toBe("32.9");
    expect(input("BMI class").value).toBe("Obese");
    expect(input("BSA (m²)").value).toBe("2.12");
    expect(Number(input("eGFR (mL/min/1.73m²)").value)).toBeLessThan(60);
    expect(input("Alert").value).toBe("Refer to nutrition; Reduced kidney function");
    fill("Weight (kg)", "60");
    expect(input("BMI class").value).toBe("Normal");
    expect(input("Alert").value).toBe("Reduced kidney function");
  });
});

describe("docs: EgInvoiceForm", () => {
  it("line totals, subtotal, VAT and total", () => {
    render(<EgInvoiceForm />);
    expect(input("Line total").value).toBe("70000");
    expect(input("Subtotal").value).toBe("70000");
    expect(input("VAT 10%").value).toBe("7000");
    expect(input("Total").value).toBe("77000");

    act(() => {
      fireEvent.click(screen.getByText("Add line"));
    });
    const prices = screen.getAllByPlaceholderText("Price");
    act(() => {
      fireEvent.change(prices[1], { target: { value: "30000" } });
    });
    expect(input("Subtotal").value).toBe("100000");
    expect(input("Total").value).toBe("110000");

    act(() => {
      fireEvent.click(screen.getAllByText("Remove")[0]);
    });
    expect(input("Subtotal").value).toBe("30000");
  });
});
