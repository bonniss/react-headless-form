/**
 * Tests: visible + shouldUnregister behavior
 *
 * Fix: BlueFormEngine giờ return <Fragment key={path} /> khi !isVisible,
 * tức là FieldProvider (và useController bên trong) bị unmount thật sự.
 * RHF tự quyết định có unregister không dựa trên shouldUnregister của useForm.
 *
 * Matrix cần cover:
 *
 *   visible  | shouldUnregister | expected payload
 *   ---------|------------------|------------------
 *   true     | false (default)  | value có mặt
 *   true     | true             | value có mặt
 *   false    | false (default)  | value VẪN CÒN (RHF giữ)
 *   false    | true             | value BỊ XÓA (RHF unregister)
 *
 * Ngoài ra cover:
 *   - toggle nhiều lần (show → hide → show → hide)
 *   - static visible: false từ đầu
 *   - section bị ẩn
 *   - array field bị ẩn
 *   - visible phụ thuộc nhiều field (wizard-like, tab-like)
 *   - defaultValue behavior khi field bị ẩn
 */

import BlueForm from "@/components/form/BlueForm"
import { useArrayField } from "@/components/form/provider"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { renderWithBlueFormProvider } from "../_utils/render-form"

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
)

/** Toggle checkbox — điều khiển visibility của field khác */
const toggleConfig = (defaultValue = false) => ({
  type: "inline" as const,
  defaultValue,
  render: ({ value, onChange }: any) => (
    <input
      type="checkbox"
      data-testid="toggle"
      checked={!!value}
      onChange={(e) => onChange(e.target.checked)}
    />
  ),
})

/** Field đơn giản dùng inline render — không tự check visible */
const inputConfig = (testId: string, defaultValue?: string) => ({
  type: "inline" as const,
  ...(defaultValue !== undefined ? { defaultValue } : {}),
  render: ({ value, onChange }: any) => (
    <input
      data-testid={testId}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
})

async function typeAndHide(inputTestId: string, value: string) {
  await waitFor(() => expect(screen.getByTestId(inputTestId)).toBeTruthy())
  fireEvent.change(screen.getByTestId(inputTestId), { target: { value } })
  fireEvent.click(screen.getByTestId("toggle"))
  await waitFor(() => expect(screen.queryByTestId(inputTestId)).toBeNull())
}

async function submit(onSubmit: ReturnType<typeof vi.fn>) {
  fireEvent.click(screen.getByRole("button", { name: /submit/i }))
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
  return onSubmit.mock.calls[0][0]
}

// ---------------------------------------------------------------------------
// 1. Baseline: shouldUnregister: false (default)
// ---------------------------------------------------------------------------

describe("visible=false + shouldUnregister: false (default)", () => {
  it("value VẪN CÒN trong payload sau khi field bị ẩn", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        config={{
          toggle: toggleConfig(),
          secret: {
            ...inputConfig("secret"),
            visible: (v: any) => !!v.toggle,
          },
        }}
      />,
    )

    fireEvent.click(screen.getByTestId("toggle"))
    await typeAndHide("secret", "sensitive")

    const payload = await submit(onSubmit)
    expect(payload).toHaveProperty("secret", "sensitive")
  })

  it("defaultValue KHÔNG vào payload khi field ẩn từ đầu vì field chưa từng mount", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        config={{
          // secret không bao giờ visible
          secret: {
            type: "inline" as const,
            defaultValue: "preset",
            visible: false,
            render: () => null,
          },
        }}
      />,
    )

    const payload = await submit(onSubmit)
    expect(payload).not.toHaveProperty("secret")
  })
})

// ---------------------------------------------------------------------------
// 2. shouldUnregister: true
// ---------------------------------------------------------------------------

describe("visible=false + shouldUnregister: true", () => {
  it("value BỊ XÓA khỏi payload sau khi field bị ẩn", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        formOptions={{ shouldUnregister: true }}
        config={{
          toggle: toggleConfig(),
          secret: {
            ...inputConfig("secret"),
            visible: (v: any) => !!v.toggle,
          },
        }}
      />,
    )

    fireEvent.click(screen.getByTestId("toggle"))
    await typeAndHide("secret", "sensitive")

    const payload = await submit(onSubmit)
    expect(payload).not.toHaveProperty("secret")
  })

  it("defaultValue cũng bị xóa khi field ẩn ngay từ đầu", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        formOptions={{ shouldUnregister: true }}
        config={{
          toggle: toggleConfig(true), // visible ban đầu
          secret: {
            ...inputConfig("secret", "preset"),
            visible: (v: any) => !!v.toggle,
          },
        }}
      />,
    )

    // field visible ban đầu → hide → submit
    await waitFor(() => expect(screen.getByTestId("secret")).toBeTruthy())
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => expect(screen.queryByTestId("secret")).toBeNull())

    const payload = await submit(onSubmit)
    expect(payload).not.toHaveProperty("secret")
  })
})

// ---------------------------------------------------------------------------
// 3. Toggle nhiều lần
// ---------------------------------------------------------------------------

describe("toggle nhiều lần", () => {
  it("shouldUnregister:false — value cuối cùng được giữ sau hide", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        config={{
          toggle: toggleConfig(),
          field: {
            ...inputConfig("field"),
            visible: (v: any) => !!v.toggle,
          },
        }}
      />,
    )

    // show → type "first"
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => screen.getByTestId("field"))
    fireEvent.change(screen.getByTestId("field"), {
      target: { value: "first" },
    })

    // hide
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => expect(screen.queryByTestId("field")).toBeNull())

    // show → type "second"
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => screen.getByTestId("field"))
    fireEvent.change(screen.getByTestId("field"), {
      target: { value: "second" },
    })

    // hide lần 2
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => expect(screen.queryByTestId("field")).toBeNull())

    const payload = await submit(onSubmit)
    // shouldUnregister:false → giữ value "second" (value cuối trước khi hide)
    expect(payload).toHaveProperty("field", "second")
  })

  it("shouldUnregister:true — value bị xóa mỗi lần hide", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        formOptions={{ shouldUnregister: true }}
        config={{
          toggle: toggleConfig(),
          field: {
            ...inputConfig("field"),
            visible: (v: any) => !!v.toggle,
          },
        }}
      />,
    )

    // show → type → hide
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => screen.getByTestId("field"))
    fireEvent.change(screen.getByTestId("field"), {
      target: { value: "hello" },
    })
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => expect(screen.queryByTestId("field")).toBeNull())

    const payload = await submit(onSubmit)
    expect(payload).not.toHaveProperty("field")
  })

  it("shouldUnregister:true — re-show sau hide thì field reset về empty", async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        formOptions={{ shouldUnregister: true }}
        config={{
          toggle: toggleConfig(),
          field: {
            ...inputConfig("field"),
            visible: (v: any) => !!v.toggle,
          },
        }}
      />,
    )

    // show → type → hide → show lại
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => screen.getByTestId("field"))
    fireEvent.change(screen.getByTestId("field"), {
      target: { value: "hello" },
    })
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => expect(screen.queryByTestId("field")).toBeNull())
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => screen.getByTestId("field"))

    // field re-mount → value reset về empty (unregistered + remounted)
    expect(
      (screen.getByTestId("field") as HTMLInputElement).value,
    ).toBe("")
  })
})

// ---------------------------------------------------------------------------
// 4. Section bị ẩn
// ---------------------------------------------------------------------------

describe("section bị ẩn", () => {
  it("shouldUnregister:false — nested section fields vẫn còn trong payload", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        config={{
          toggle: toggleConfig(),
          address: {
            type: "section" as const,
            visible: (v: any) => !!v.toggle,
            props: {
              nested: true,
              config: {
                city: {
                  type: "inline" as const,
                  defaultValue: "HN",
                  render: () => null,
                },
                zip: {
                  type: "inline" as const,
                  defaultValue: "10000",
                  render: () => null,
                },
              },
            },
          },
        }}
      />,
    )

    // show → hide
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => {}) // let section mount
    fireEvent.click(screen.getByTestId("toggle"))

    const payload = await submit(onSubmit)
    // shouldUnregister:false → address.city và address.zip vẫn còn
    expect(payload).toHaveProperty("address.city", "HN")
    expect(payload).toHaveProperty("address.zip", "10000")
  })

  it("shouldUnregister:true — nested section fields bị xóa khi section ẩn", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        formOptions={{ shouldUnregister: true }}
        config={{
          toggle: toggleConfig(true), // section visible ban đầu
          address: {
            type: "section" as const,
            visible: (v: any) => !!v.toggle,
            props: {
              nested: true,
              config: {
                city: {
                  type: "inline" as const,
                  defaultValue: "HN",
                  render: () => null,
                },
                zip: {
                  type: "inline" as const,
                  defaultValue: "10000",
                  render: () => null,
                },
              },
            },
          },
        }}
      />,
    )

    // section visible ban đầu → hide
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => {}) // let section unmount

    const payload = await submit(onSubmit)
    expect(payload).not.toHaveProperty("address")
  })
})

// ---------------------------------------------------------------------------
// 5. Array field bị ẩn
// ---------------------------------------------------------------------------

describe("array field bị ẩn", () => {
  it("shouldUnregister:false — array values vẫn còn khi field ẩn", async () => {
    const onSubmit = vi.fn()

    const ArrayUI = () => {
      const { append } = useArrayField()
      return (
        <button type="button" onClick={() => append({ name: "item" })}>
          Add
        </button>
      )
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        fieldMapping={{ array: ArrayUI }}
        config={{
          toggle: toggleConfig(true), // array visible ban đầu
          items: {
            type: "array" as const,
            visible: (v: any) => !!v.toggle,
            props: { config: {} },
          },
        }}
      />,
    )

    // add item → hide array
    fireEvent.click(screen.getByText("Add"))
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => expect(screen.queryByText("Add")).toBeNull())

    const payload = await submit(onSubmit)
    expect(payload).toHaveProperty("items")
    expect(payload.items).toHaveLength(1)
  })

  it("shouldUnregister:true — array bị xóa khi field ẩn", async () => {
    const onSubmit = vi.fn()

    const ArrayUI = () => {
      const { append } = useArrayField()
      return (
        <button type="button" onClick={() => append({ name: "item" })}>
          Add
        </button>
      )
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        formOptions={{ shouldUnregister: true }}
        fieldMapping={{ array: ArrayUI }}
        config={{
          toggle: toggleConfig(true),
          items: {
            type: "array" as const,
            visible: (v: any) => !!v.toggle,
            props: { config: {} },
          },
        }}
      />,
    )

    fireEvent.click(screen.getByText("Add"))
    fireEvent.click(screen.getByTestId("toggle"))
    await waitFor(() => expect(screen.queryByText("Add")).toBeNull())

    const payload = await submit(onSubmit)
    expect(payload).not.toHaveProperty("items")
  })
})

// ---------------------------------------------------------------------------
// 6. Visible phụ thuộc nhiều field (wizard-like / tab-like)
// ---------------------------------------------------------------------------

describe("visible phụ thuộc nhiều field — wizard/tab pattern", () => {
  /**
   * Mô phỏng wizard 3 bước dùng step index:
   *   step=0 → chỉ thấy step0 fields
   *   step=1 → chỉ thấy step1 fields
   *   step=2 → chỉ thấy step2 fields
   *
   * Dùng inline render để set step, không cần UI thật.
   */
  it("shouldUnregister:false — tất cả steps giữ value trong payload", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        defaultValues={{ step: 0 }}
        config={{
          step: {
            type: "inline" as const,
            render: ({ value, onChange }) => (
              <div>
                <span data-testid="step">{value}</span>
                <button
                  type="button"
                  onClick={() => onChange((value ?? 0) + 1)}
                >
                  Next
                </button>
              </div>
            ),
          },
          name: {
            ...inputConfig("name"),
            visible: (v: any) => v.step === 0,
          },
          email: {
            ...inputConfig("email"),
            visible: (v: any) => v.step === 1,
          },
          bio: {
            ...inputConfig("bio"),
            visible: (v: any) => v.step === 2,
          },
        }}
      />,
    )

    // step 0: fill name
    await waitFor(() => screen.getByTestId("name"))
    fireEvent.change(screen.getByTestId("name"), { target: { value: "Alice" } })

    // step 1: fill email
    fireEvent.click(screen.getByText("Next"))
    await waitFor(() => screen.getByTestId("email"))
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@ex.com" },
    })

    // step 2: fill bio
    fireEvent.click(screen.getByText("Next"))
    await waitFor(() => screen.getByTestId("bio"))
    fireEvent.change(screen.getByTestId("bio"), {
      target: { value: "Developer" },
    })

    const payload = await submit(onSubmit)
    // shouldUnregister:false → tất cả 3 steps giữ value
    expect(payload).toHaveProperty("name", "Alice")
    expect(payload).toHaveProperty("email", "alice@ex.com")
    expect(payload).toHaveProperty("bio", "Developer")
  })

  it("shouldUnregister:true — chỉ step hiện tại có value trong payload", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        formOptions={{ shouldUnregister: true }}
        defaultValues={{ step: 0 }}
        config={{
          step: {
            type: "inline" as const,
            render: ({ value, onChange }) => (
              <div>
                <button
                  type="button"
                  onClick={() => onChange((value ?? 0) + 1)}
                >
                  Next
                </button>
              </div>
            ),
          },
          name: {
            ...inputConfig("name"),
            visible: (v: any) => v.step === 0,
          },
          email: {
            ...inputConfig("email"),
            visible: (v: any) => v.step === 1,
          },
        }}
      />,
    )

    // step 0: fill name
    await waitFor(() => screen.getByTestId("name"))
    fireEvent.change(screen.getByTestId("name"), { target: { value: "Alice" } })

    // step 1: name unmounts → bị unregister
    fireEvent.click(screen.getByText("Next"))
    await waitFor(() => screen.getByTestId("email"))
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@ex.com" },
    })

    const payload = await submit(onSubmit)
    // shouldUnregister:true → name đã bị xóa khi chuyển step
    expect(payload).not.toHaveProperty("name")
    expect(payload).toHaveProperty("email", "alice@ex.com")
  })

  /**
   * Tab pattern: chỉ 1 tab visible tại một thời điểm.
   * shouldUnregister:false → switch tab không mất data.
   */
  it("tab pattern — shouldUnregister:false giữ data khi switch tab", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        defaultValues={{ tab: "a" }}
        config={{
          tab: {
            type: "inline" as const,
            render: ({ onChange }) => (
              <div>
                <button type="button" onClick={() => onChange("a")}>
                  Tab A
                </button>
                <button type="button" onClick={() => onChange("b")}>
                  Tab B
                </button>
              </div>
            ),
          },
          fieldA: {
            ...inputConfig("fieldA"),
            visible: (v: any) => v.tab === "a",
          },
          fieldB: {
            ...inputConfig("fieldB"),
            visible: (v: any) => v.tab === "b",
          },
        }}
      />,
    )

    // Tab A: fill
    await waitFor(() => screen.getByTestId("fieldA"))
    fireEvent.change(screen.getByTestId("fieldA"), {
      target: { value: "dataA" },
    })

    // Switch to Tab B: fill
    fireEvent.click(screen.getByText("Tab B"))
    await waitFor(() => screen.getByTestId("fieldB"))
    fireEvent.change(screen.getByTestId("fieldB"), {
      target: { value: "dataB" },
    })

    const payload = await submit(onSubmit)
    // shouldUnregister:false → cả 2 tabs giữ data
    expect(payload).toHaveProperty("fieldA", "dataA")
    expect(payload).toHaveProperty("fieldB", "dataB")
  })
})

// ---------------------------------------------------------------------------
// 7. visible: false tĩnh từ đầu (không phải function)
// ---------------------------------------------------------------------------

describe("static visible: false từ đầu", () => {
  it("field không render và không có value trong payload khi shouldUnregister:true", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        formOptions={{ shouldUnregister: true }}
        config={{
          name: inputConfig("name"),
          hidden: {
            type: "inline" as const,
            visible: false,
            defaultValue: "ghost",
            render: () => <div data-testid="ghost" />,
          },
        }}
      />,
    )

    // ghost không được render
    expect(screen.queryByTestId("ghost")).toBeNull()

    const payload = await submit(onSubmit)
    expect(payload).not.toHaveProperty("hidden")
  })

  it("shouldUnregister:false — value vẫn không có khi field không visible từ đầu", async () => {
    const onSubmit = vi.fn()

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        config={{
          hidden: {
            type: "inline" as const,
            visible: false,
            defaultValue: "ghost",
            render: () => null,
          },
        }}
      />,
    )

    const payload = await submit(onSubmit)
    expect(payload).not.toHaveProperty("hidden")
  })
})
