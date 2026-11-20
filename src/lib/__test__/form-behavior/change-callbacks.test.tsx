import BlueForm from "@/components/form/BlueForm";
import type { BlueFormRef } from "@/types/form";
import { act, fireEvent, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithBlueFormProvider } from "../_utils/render-form";

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>{children}</form>
);

const config = {
  name: {
    type: "inline" as const,
    render: ({ onChange }: any) => (
      <button type="button" onClick={() => onChange?.("A")}>
        change
      </button>
    ),
  },
};

afterEach(() => {
  vi.useRealTimers();
});

describe("BlueForm – change callbacks", () => {
  it("calls the latest onFieldChange after re-render (no stale closure)", () => {
    const calls: string[] = [];

    const { rerender } = renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFieldChange={() => calls.push("v1")}
        config={config}
      />,
    );

    rerender(
      <BlueForm
        renderRoot={TestRoot}
        onFieldChange={() => calls.push("v2")}
        config={config}
      />,
    );

    fireEvent.click(screen.getByText("change"));
    expect(calls).toEqual(["v2"]);
  });

  it("flushes a pending debounced change when the form unmounts", () => {
    vi.useFakeTimers();
    const onFormChange = vi.fn();

    const { unmount } = renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        debounceMs={700}
        onFormChange={onFormChange}
        config={config}
      />,
    );

    fireEvent.click(screen.getByText("change"));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onFormChange).not.toHaveBeenCalled();

    unmount();

    expect(onFormChange).toHaveBeenCalledTimes(1);
    expect(onFormChange.mock.calls[0][0]).toEqual({ name: "A" });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onFormChange).toHaveBeenCalledTimes(1);
  });

  it("exposes flushChanges() on the ref", () => {
    vi.useFakeTimers();
    const onFieldChange = vi.fn();
    const ref = createRef<BlueFormRef>();

    renderWithBlueFormProvider(
      <BlueForm
        ref={ref}
        renderRoot={TestRoot}
        debounceMs={700}
        onFieldChange={onFieldChange}
        config={config}
      />,
    );

    fireEvent.click(screen.getByText("change"));
    expect(onFieldChange).not.toHaveBeenCalled();

    act(() => {
      ref.current?.flushChanges();
    });
    expect(onFieldChange).toHaveBeenCalledTimes(1);
    expect(onFieldChange.mock.calls[0][0]).toMatchObject({
      name: "name",
      value: "A",
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onFieldChange).toHaveBeenCalledTimes(1);
  });

  it("flushChanges() is a no-op without debounce", () => {
    const ref = createRef<BlueFormRef>();
    renderWithBlueFormProvider(
      <BlueForm ref={ref} renderRoot={TestRoot} config={config} />,
    );
    expect(() => ref.current?.flushChanges()).not.toThrow();
  });
});
