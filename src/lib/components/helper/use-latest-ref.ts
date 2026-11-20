import { useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : () => {};

/**
 * Keeps a ref pointing at the latest value passed in.
 *
 * Lets long-lived callbacks (subscriptions, debounced functions) read the
 * newest props without being recreated on every render.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
