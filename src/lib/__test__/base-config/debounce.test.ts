import { debounce } from "@/components/helper/debounce";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("debounce helper", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("calls once with the latest args after the delay", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d(1);
    d(2);
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2);
  });

  it("flush runs the pending call immediately, once", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d("a");
    d.flush();
    expect(fn).toHaveBeenCalledWith("a");
    vi.advanceTimersByTime(200);
    d.flush();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("cancel drops the pending call", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d("a");
    d.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it("ms <= 0 calls synchronously", () => {
    const fn = vi.fn();
    debounce(fn, 0)("x");
    expect(fn).toHaveBeenCalledWith("x");
  });
});
