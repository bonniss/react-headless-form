import BlueForm from "@/components/form/BlueForm";
import type { BlueFormRef } from "@/types/form";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { useFormContext as useRHFFormContext } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { renderWithBlueFormProvider } from "../_utils/render-form";

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

const requiredConfig = {
  name: {
    type: "inline" as const,
    rules: { required: "Required" },
    render: () => null,
  },
};

describe("BlueForm – submit lifecycle", () => {
  it("routes errors thrown by onSubmit to onSubmitFailure", async () => {
    const error = new Error("API down");
    const onSubmitSuccess = vi.fn();
    const onSubmitFailure = vi.fn();
    const ref = createRef<BlueFormRef>();

    renderWithBlueFormProvider(
      <BlueForm
        ref={ref}
        renderRoot={TestRoot}
        defaultValues={{ name: "x" }}
        onSubmit={async () => {
          throw error;
        }}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitFailure={onSubmitFailure}
        config={{ name: { type: "hidden" } }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => expect(onSubmitFailure).toHaveBeenCalledTimes(1));
    const [err, values, form] = onSubmitFailure.mock.calls[0];
    expect(err).toBe(error);
    expect(values).toEqual({ name: "x" });
    expect(typeof form.setError).toBe("function");
    expect(onSubmitSuccess).not.toHaveBeenCalled();
    expect(ref.current?.formState.isSubmitSuccessful).toBe(false);
  });

  it("logs instead of producing an unhandled rejection when onSubmitFailure is missing", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={() => {
          throw new Error("boom");
        }}
        config={{ name: { type: "hidden" } }}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining("[react-headless-form]"),
        expect.any(Error),
      ),
    );
    consoleError.mockRestore();
  });

  it("calls onInvalid on validation errors and does not call onSubmit", async () => {
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();
    const onSubmitFailure = vi.fn();

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={onSubmit}
        onInvalid={onInvalid}
        onSubmitFailure={onSubmitFailure}
        config={requiredConfig}
      />,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => expect(onInvalid).toHaveBeenCalledTimes(1));
    expect(onInvalid.mock.calls[0][0]).toHaveProperty("name");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onSubmitFailure).not.toHaveBeenCalled();
  });

});

describe("BlueForm – react-hook-form context", () => {
  it("useFormContext imported from react-hook-form sees the BlueForm context", () => {
    let ctx: unknown = "unset";
    const Probe = () => {
      ctx = useRHFFormContext();
      return null;
    };

    renderWithBlueFormProvider(
      <BlueForm renderRoot={TestRoot} config={{}}>
        <Probe />
      </BlueForm>,
    );

    expect(ctx).not.toBeNull();
    expect(typeof (ctx as any).getValues).toBe("function");
  });
});
