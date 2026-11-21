import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EgSchemaForm from "../../../../docs/src/examples/_shared/EgSchemaForm";

const fill = (placeholder: string, value: string) =>
  fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });

describe("docs: EgSchemaForm", () => {
  it("shows schema errors, then submits the coerced output", async () => {
    render(<EgSchemaForm />);
    await act(async () => {
      fireEvent.click(screen.getByText("Sign up"));
    });
    expect(screen.getByText("Name is required")).toBeTruthy();
    expect(screen.getByText("Invalid email")).toBeTruthy();

    act(() => {
      fill("Name", "  Ann  ");
      fill("Email", "ann@example.com");
      fill("Age", "16");
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Sign up"));
    });
    expect(screen.getByText("Must be 18 or older")).toBeTruthy();

    act(() => fill("Age", "30"));
    await act(async () => {
      fireEvent.click(screen.getByText("Sign up"));
    });
    await waitFor(() => screen.getByTestId("output"));
    expect(JSON.parse(screen.getByTestId("output").textContent!)).toEqual({
      name: "Ann",
      email: "ann@example.com",
      age: 30,
      role: "developer",
    });
  });
});
