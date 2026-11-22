import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EgComputableForm from "../../../../docs/src/examples/_shared/EgComputableForm";

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
