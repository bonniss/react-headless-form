import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EgArktypeForm from "../../../../docs/src/examples/_shared/EgArktypeForm";
import EgValibotForm from "../../../../docs/src/examples/_shared/EgValibotForm";
import EgZodForm from "../../../../docs/src/examples/_shared/EgZodForm";

const fill = (placeholder: string, value: string) =>
  act(() => {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
  });
const submit = async () => {
  await act(async () => {
    fireEvent.click(screen.getByText("Sign up"));
  });
};

describe.each([
  ["zod", EgZodForm],
  ["valibot", EgValibotForm],
  ["arktype", EgArktypeForm],
])("docs: schema prop with %s", (_, Example) => {
  it("shows the schema's messages, then submits the parsed output", async () => {
    render(<Example />);
    await submit();
    expect(screen.queryByTestId("output")).toBeNull();
    await waitFor(() => expect(screen.getByText("Invalid email")).toBeTruthy());

    fill("Name", "  Ann ");
    fill("Email", "ann@example.com");
    fill("Age", "16");
    await submit();
    await waitFor(() => expect(screen.getByText("Must be 18 or older")).toBeTruthy());

    fill("Age", "30");
    await submit();
    await waitFor(() => screen.getByTestId("output"));
    expect(JSON.parse(screen.getByTestId("output").textContent!)).toEqual({
      name: "Ann",
      email: "ann@example.com",
      age: 30,
    });
  });
});
