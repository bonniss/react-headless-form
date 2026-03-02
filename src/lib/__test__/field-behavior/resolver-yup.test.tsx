/**
 * Test suite: BlueForm + Yup resolver (real integration)
 *
 * Setup: pnpm add -D yup @hookform/resolvers
 *
 * Note on undefined fields:
 * BlueForm fields start as undefined when untouched. Yup handles this
 * differently from Zod — use .required() with a custom message, and
 * .typeError() for type mismatch cases (e.g. number fields).
 * Alternatively, set defaultValue in field config or defaultValues on the form.
 */

import BlueForm from "@/components/form/BlueForm"
import { useField } from "@/components"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
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
    fieldProps: { value, onChange, errorMessage },
  } = useField()
  return (
    <div>
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

const nameSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),
})

const profileSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().required("Email is required").email("Invalid email"),
  age: yup
    .number()
    .typeError("Must be at least 18")
    .min(18, "Must be at least 18"),
})

const nestedSchema = yup.object({
  profile: yup.object({
    username: yup.string().required("Username is required"),
    bio: yup.string().max(100, "Bio must be 100 characters or less"),
  }),
})

// ─────────────────────────────────────────────────────────────────────────────

describe("BlueForm – Yup resolver integration", () => {
  // ─── basic validation ───────────────────────────────────────────────────

  it("shows yup error when required field is empty on submit", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: yupResolver(nameSchema) }}
        config={{
          name: {
            type: "inline",
            defaultValue: "",
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

  it("shows correct yup error based on value length", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{
          mode: "onChange",
          resolver: yupResolver(nameSchema),
        }}
        config={{
          name: {
            type: "inline",
            defaultValue: "",
            render: () => <InputField />,
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Name is required")
    })

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
          resolver: yupResolver(nameSchema),
        }}
        config={{
          name: {
            type: "inline",
            defaultValue: "",
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
        formProps={{ resolver: yupResolver(nameSchema) }}
        onSubmit={onSubmit}
        config={{
          name: {
            type: "inline",
            defaultValue: "",
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

  it("calls onSubmit with data when schema validation passes", async () => {
    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: yupResolver(nameSchema) }}
        onSubmit={(data) => {
          submitted = data
        }}
        config={{
          name: {
            type: "inline",
            defaultValue: "",
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

  it("casts value type per schema on submit (number field)", async () => {
    const schema = yup.object({
      age: yup
        .number()
        .typeError("Invalid number")
        .min(1, "Must be at least 1"),
    })

    let submitted: any = null

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: yupResolver(schema) }}
        onSubmit={(data) => {
          submitted = data
        }}
        config={{
          age: {
            type: "inline",
            defaultValue: "",
            render: () => <InputField />,
          },
        }}
      />,
    )

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "25" },
    })
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(submitted).toEqual({ age: 25 }) // cast to number
    })
  })

  // ─── multiple fields ──────────────────────────────────────────────────────

  it("shows errors on all invalid fields simultaneously", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{
          resolver: yupResolver(profileSchema, { abortEarly: false }),
        }}
        defaultValues={{ name: "", email: "", age: undefined }}
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
      target: { value: "10" }, // under 18 — triggers min error
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
        formProps={{ resolver: yupResolver(profileSchema) }}
        defaultValues={{ name: "", email: "", age: undefined }}
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
        formProps={{ resolver: yupResolver(nestedSchema) }}
        defaultValues={{ profile: { username: "", bio: "" } }}
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
      target: { value: "x".repeat(101) },
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

  it("does not fire field-level rules when yupResolver is provided", async () => {
    const permissiveSchema = yup.object({ name: yup.string() })

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: yupResolver(permissiveSchema) }}
        config={{
          name: {
            type: "inline",
            defaultValue: "",
            rules: { required: "Rules: required" },
            render: () => <InputField />,
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.queryByTestId("error")).toBeNull()
    })
  })

  // ─── dev warning ──────────────────────────────────────────────────────────

  it("warns when yupResolver and field rules are both present", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formProps={{ resolver: yupResolver(nameSchema) }}
        config={{
          name: {
            type: "inline",
            defaultValue: "",
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
