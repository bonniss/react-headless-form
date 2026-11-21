export type Debounced<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  /** Runs the pending call now, if any. */
  flush: () => void;
  /** Drops the pending call, if any. */
  cancel: () => void;
};

/**
 * Trailing-edge debounce: calls `fn` with the latest arguments once `ms` has
 * passed without a new call. With `ms <= 0`, calls `fn` synchronously.
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  ms: number,
): Debounced<TArgs> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: TArgs | undefined;

  const run = () => {
    const args = pending;
    timer = undefined;
    pending = undefined;
    if (args) fn(...args);
  };

  const cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };

  const debounced = (...args: TArgs) => {
    if (ms <= 0) {
      fn(...args);
      return;
    }
    pending = args;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(run, ms);
  };

  const flush = () => {
    if (timer !== undefined) clearTimeout(timer);
    run();
  };

  return Object.assign(debounced, { flush, cancel });
}
