import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AjvForm from "../../../../docs/src/examples/_shared/schema/ajv";
import ArktypeForm from "../../../../docs/src/examples/_shared/schema/arktype";
import ValibotForm from "../../../../docs/src/examples/_shared/schema/valibot";
import YupForm from "../../../../docs/src/examples/_shared/schema/yup";
import ZodForm from "../../../../docs/src/examples/_shared/schema/zod";

const fill = (label: string, value: string) =>
  act(() => {
    fireEvent.change(screen.getByLabelText(label, { exact: false }), { target: { value } });
  });
const submit = async () => {
  await act(async () => {
    fireEvent.click(screen.getByText("Sign up"));
  });
};

// `name` is the typed name and the expected output (Ajv does not trim)
describe.each([
  ["zod", ZodForm, "  Ann "],
  ["valibot", ValibotForm, "  Ann "],
  ["arktype", ArktypeForm, "  Ann "],
  ["yup", YupForm, "  Ann "],
  ["ajv", AjvForm, "Ann"],
])("docs: schema example with %s", (_, Example, name) => {
  it("shows the schema's messages, then submits the parsed output", async () => {
    render(<Example />);
    await submit();
    expect(screen.queryByTestId("output")).toBeNull();
    await waitFor(() => expect(screen.getByText("Name is required")).toBeTruthy());

    fill("Name", name);
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
