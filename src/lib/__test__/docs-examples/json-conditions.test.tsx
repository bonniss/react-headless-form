import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EgJsonConditionsForm from "../../../../docs/src/examples/_shared/EgJsonConditionsForm";

const select = (index: number, value: string) =>
  act(() => {
    fireEvent.change(screen.getAllByRole("combobox")[index], { target: { value } });
  });

describe("docs: EgJsonConditionsForm", () => {
  it("evaluates the stored JSON conditions", () => {
    render(<EgJsonConditionsForm />);
    expect(screen.queryByLabelText(/^Seats( \*)?$/)).toBeNull();
    expect(screen.queryByText("Members")).toBeNull();

    select(0, "team");
    expect(screen.getByLabelText(/^Seats( \*)?$/)).toBeTruthy();
    expect(screen.getByText("Members")).toBeTruthy();
    expect(screen.queryByLabelText(/^Invoice\ email( \*)?$/)).toBeNull();
    expect(screen.queryByText("Billing contact")).toBeNull();

    // per-row condition
    select(1, "other");
    expect(screen.getByLabelText(/^Describe\ the\ role( \*)?$/)).toBeTruthy();

    // root condition inside the row, and required from another field
    select(0, "business");
    expect(screen.getByText("Billing contact")).toBeTruthy();
    act(() => {
      fireEvent.change(screen.getByLabelText(/^Seats( \*)?$/), { target: { value: "12" } });
    });
    expect(screen.getByLabelText(/^Invoice\ email( \*)?$/).getAttribute("aria-required")).toBe("true");
  });
});
