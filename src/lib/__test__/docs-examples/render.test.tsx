import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EgRenderForm from "../../../../docs/src/examples/_shared/EgRenderForm";

const click = (name: string | RegExp) =>
  act(() => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
const type = (placeholder: string, value: string, index = 0) =>
  act(() => {
    fireEvent.change(screen.getAllByPlaceholderText(placeholder)[index], { target: { value } });
  });
const submit = () =>
  act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  });

describe("docs: EgRenderForm", () => {
  it("inline render: errors and value come through the render props", async () => {
    render(<EgRenderForm />);
    await submit();
    expect(screen.getByText("Pick a rating")).toBeTruthy();
    click("4 stars");
    expect(screen.getByRole("button", { name: "4 stars" }).getAttribute("aria-pressed")).toBe("true");
    await waitFor(() => expect(screen.queryByText("Pick a rating")).toBeNull());
  });

  it("mapped self, section children and array shell all submit", async () => {
    render(<EgRenderForm />);
    expect(screen.getByText("Shown on your public profile")).toBeTruthy();
    expect(screen.getByText("Contact").tagName).toBe("LEGEND");
    click("3 stars");
    type("Name", "Ann");
    type("City", "Hanoi");
    click("+ Add tag");
    type("Tag", "react", 1);
    await submit();
    await waitFor(() => screen.getByTestId("payload"));
    const payload = JSON.parse(screen.getByTestId("payload").textContent ?? "{}");
    expect(payload).toMatchObject({ rating: 3, name: "Ann", city: "Hanoi", tags: [{ label: "docs" }, { label: "react" }] });
  });

  it("array: remove works and maxLength errors in the shell", async () => {
    render(<EgRenderForm />);
    click("3 stars");
    type("Name", "Ann");
    for (let i = 0; i < 3; i++) click("+ Add tag");
    for (let i = 0; i < 4; i++) type("Tag", `t${i}`, i);
    await submit();
    await waitFor(() => expect(screen.getByText("At most 3 tags")).toBeTruthy());
    act(() => {
      fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[3]);
    });
    expect(screen.getAllByPlaceholderText("Tag")).toHaveLength(3);
    await submit();
    await waitFor(() => screen.getByTestId("payload"));
  });
});
