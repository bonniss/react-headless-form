/**
 * Test suite: BlueForm + Zod resolver (real integration)
 *
 * Setup: pnpm add -D zod @hookform/resolvers
 */

import BlueForm from "@/components/form/BlueForm"
import { useField } from "@/components"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { renderWithBlueFormProvider } from "../_utils/render-form"

// ─── shared test components ───────────────────────────────────────────────────

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
)

const InputField = () => {
  const {
    fieldProps: { value, onChange, errorMessage, label },
  } = useField()
  return (
    <div>
      {label && <label>{label}</label>}
      <input
        data-testid="input"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {errorMessage && <div data-testid="error">{errorMessage}</div>}
    </div>
  )
}

const MultiInputField = ({ name }: { name: string }) => {
  const {
    fieldProps: { value, onChange, errorMessage },
  } = useField()
  return (
    <div>
      <input
        data-testid={`input-${name}`}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {errorMessage && <div data-testid={`error-${name}`}>{errorMessage}</div>}
    </div>
  )
}

// ─── schemas ──────────────────────────────────────────────────────────────────

// BlueForm fields start as undefined when untouched — coerce to "" so Zod
// string validators receive an empty string instead of undefined, allowing
// custom messages to show correctly instead of Zod's type error.
const str = (schema: z.ZodString) => z.preprocess((v) => v ?? "", schema)

const nameSchema = z.object({
  name: str(
    z
      .string()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters"),
  ),
})

const profileSchema = z.object({
  name: str(z.string().min(1, "Name is required")),
  email: str(z.string().email("Invalid email")),
  age: z.coerce.number().min(18, "Must be at least 18"),
})

const nestedSchema = z.object({
  profile: z.object({
    username: str(z.string().min(1, "Username is required")),
    bio: str(z.string().max(100, "Bio must be 100 characters or less")),
  }),
})

// ─────────────────────────────────────────────────────────────────────────────

describe("BlueForm – Zod resolver integration", () => {
  // ─── basic validation ───────────────────────────────────────────────────

  it("shows zod error when required field is empty on submit", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: zodResolver(nameSchema) }}
        config={{
          name: {
            type: "inline",
            render: () => <InputField />,
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Name is required")
    })
  })

  it("shows correct zod error based on value length", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{
          mode: "onChange",
          resolver: zodResolver(nameSchema),
        }}
        config={{
          name: {
            type: "inline",
            render: () => <InputField />,
          },
        }}
      />,
    )

    // trigger submit first để activate validation
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Name is required")
    })

    // type 2 ký tự — sẽ pass required nhưng fail minLength
    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "ab" },
    })

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe(
        "Name must be at least 3 characters",
      )
    })
  })

  it("clears error when value becomes valid", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{
          mode: "onChange",
          resolver: zodResolver(nameSchema),
        }}
        config={{
          name: {
            type: "inline",
            render: () => <InputField />,
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeTruthy()
    })

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "Alice" },
    })

    await waitFor(() => {
      expect(screen.queryByTestId("error")).toBeNull()
    })
  })

  // ─── submit behavior ─────────────────────────────────────────────────────

  it("does not call onSubmit when schema validation fails", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: zodResolver(nameSchema) }}
        onSubmit={onSubmit}
        config={{
          name: {
            type: "inline",
            render: () => <InputField />,
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeTruthy()
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("calls onSubmit with typed data when schema validation passes", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: zodResolver(nameSchema) }}
        onSubmit={(data) => {
          submitted = data
        }}
        config={{
          name: {
            type: "inline",
            render: () => <InputField />,
          },
        }}
      />,
    )

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "Alice" },
    })
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({ name: "Alice" })
    })
  })

  it("coerces value type per schema on submit (number field)", async () => {
    const schema = z.object({
      age: z.coerce.number().min(1),
    })

    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: zodResolver(schema) }}
        onSubmit={(data) => {
          submitted = data
        }}
        config={{
          age: {
            type: "inline",
            render: () => <InputField />,
          },
        }}
      />,
    )

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "25" }, // string input
    })
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({ age: 25 }) // coerced to number
    })
  })

  // ─── multiple fields ──────────────────────────────────────────────────────

  it("shows errors on all invalid fields simultaneously", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: zodResolver(profileSchema) }}
        config={{
          name: {
            type: "inline",
            render: () => <MultiInputField name="name" />,
          },
          email: {
            type: "inline",
            render: () => <MultiInputField name="email" />,
          },
          age: {
            type: "inline",
            render: () => <MultiInputField name="age" />,
          },
        }}
      />,
    )

    fireEvent.change(screen.getByTestId("input-email"), {
      target: { value: "not-an-email" },
    })
    fireEvent.change(screen.getByTestId("input-age"), {
      target: { value: "10" }, // under 18
    })

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByTestId("error-name").textContent).toBe(
        "Name is required",
      )
      expect(screen.getByTestId("error-email").textContent).toBe(
        "Invalid email",
      )
      expect(screen.getByTestId("error-age").textContent).toBe(
        "Must be at least 18",
      )
    })
  })

  it("submits successfully when all fields pass schema", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: zodResolver(profileSchema) }}
        onSubmit={(data) => {
          submitted = data
        }}
        config={{
          name: {
            type: "inline",
            render: () => <MultiInputField name="name" />,
          },
          email: {
            type: "inline",
            render: () => <MultiInputField name="email" />,
          },
          age: {
            type: "inline",
            render: () => <MultiInputField name="age" />,
          },
        }}
      />,
    )

    fireEvent.change(screen.getByTestId("input-name"), {
      target: { value: "Alice" },
    })
    fireEvent.change(screen.getByTestId("input-email"), {
      target: { value: "alice@example.com" },
    })
    fireEvent.change(screen.getByTestId("input-age"), {
      target: { value: "25" },
    })

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({
        name: "Alice",
        email: "alice@example.com",
        age: 25,
      })
    })
  })

  // ─── nested schema ────────────────────────────────────────────────────────

  it("validates nested object fields via schema", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: zodResolver(nestedSchema) }}
        config={{
          profile: {
            type: "section",
            props: {
              nested: true,
              config: {
                username: {
                  type: "inline",
                  render: () => <MultiInputField name="username" />,
                },
                bio: {
                  type: "inline",
                  render: () => <MultiInputField name="bio" />,
                },
              },
            },
          },
        }}
      />,
    )

    fireEvent.change(screen.getByTestId("input-bio"), {
      target: { value: "x".repeat(101) }, // exceeds max 100
    })

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByTestId("error-username").textContent).toBe(
        "Username is required",
      )
      expect(screen.getByTestId("error-bio").textContent).toBe(
        "Bio must be 100 characters or less",
      )
    })
  })

  // ─── rules are disabled with resolver ────────────────────────────────────

  it("does not fire field-level rules when zodResolver is provided", async () => {
    // schema allows empty string — rules would block it, but should be ignored
    const permissiveSchema = z.object({ name: z.string() })

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: zodResolver(permissiveSchema) }}
        config={{
          name: {
            type: "inline",
            rules: { required: "Rules: required" },
            render: () => <InputField />,
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    // schema passes, rules must not fire
    await waitFor(() => {
      expect(screen.queryByTestId("error")).toBeNull()
    })
  })

  // ─── dev warning ──────────────────────────────────────────────────────────

  it("warns when zodResolver and field rules are both present", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: zodResolver(nameSchema) }}
        config={{
          name: {
            type: "inline",
            rules: { required: true },
            render: () => <InputField />,
          },
        }}
      />,
    )

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[react-headless-form]"),
    )

    warn.mockRestore()
  })
})
