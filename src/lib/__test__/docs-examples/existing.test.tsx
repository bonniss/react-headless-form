/**
 * Docs examples (docs/src/examples/_shared) run against the library source,
 * so the live demos cannot silently break.
 */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EgArrayForm from "../../../../docs/src/examples/_shared/EgArrayForm";
import EgConditionalForm from "../../../../docs/src/examples/_shared/EgConditionalForm";
import EgLoginForm from "../../../../docs/src/examples/_shared/EgLoginForm";
import EgNestedForm from "../../../../docs/src/examples/_shared/EgNestedForm";
import EgRegistrationForm from "../../../../docs/src/examples/_shared/EgRegistrationForm";

describe("docs examples render", () => {
  it.each([
    ["EgLoginForm", EgLoginForm],
    ["EgRegistrationForm", EgRegistrationForm],
    ["EgNestedForm", EgNestedForm],
    ["EgArrayForm", EgArrayForm],
    ["EgConditionalForm", EgConditionalForm],
  ])("%s", (_, Example) => {
    const { container } = render(<Example />);
    expect(container.querySelector("form")).not.toBeNull();
  });
});

describe("docs examples use the library source", () => {
  // A second React copy (docs has React 19) would already fail the renders
  // above with "Invalid hook call"; this checks the library alias.
  it("resolves react-headless-form to src/lib", async () => {
    const fromDocs = await import("react-headless-form");
    const fromSrc = await import("@/index");
    expect(fromDocs.setupForm).toBe(fromSrc.setupForm);
  });
});
