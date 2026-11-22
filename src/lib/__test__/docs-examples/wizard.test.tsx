import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EgWizardForm from "../../../../docs/src/examples/_shared/EgWizardForm";

const fill = (placeholder: string, value: string) =>
  act(() => {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
  });
const click = async (text: string) => {
  await act(async () => {
    fireEvent.click(screen.getByText(text));
  });
};

describe("docs: EgWizardForm (recipe)", () => {
  it("blocks Next on an invalid step, keeps values when going back, submits everything", async () => {
    render(<EgWizardForm />);

    // step 1 invalid → stays, shows errors
    await click("Next →");
    expect(screen.getByText("Email is required")).toBeTruthy();
    expect(screen.queryByPlaceholderText("Full Name")).toBeNull();

    fill("Email", "ada@example.com");
    fill("Password", "secret1");
    await click("Next →");
    await waitFor(() => screen.getByPlaceholderText("Full Name"));

    // step 2 invalid → stays
    await click("Next →");
    expect(screen.getByText("Full name is required")).toBeTruthy();

    // back keeps step 1 values
    await click("← Back");
    expect((screen.getByPlaceholderText("Email") as HTMLInputElement).value).toBe("ada@example.com");
    await click("Next →");
    await waitFor(() => screen.getByPlaceholderText("Full Name"));

    fill("Full Name", "Ada Lovelace");
    await click("Next →");
    await waitFor(() => screen.getByText("Submit"));

    await click("Submit");
    await waitFor(() => screen.getByTestId("output"));
    expect(JSON.parse(screen.getByTestId("output").textContent!)).toMatchObject({
      account: { email: "ada@example.com", password: "secret1" },
      profile: { fullName: "Ada Lovelace" },
      preferences: { role: "developer" },
    });
  });
});
