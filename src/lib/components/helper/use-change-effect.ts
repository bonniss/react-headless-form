import { useEffect, useRef } from "react";

/** Runs `effect` when `value` changes, not on mount. */
export function useChangeEffect(value: unknown, effect: () => void) {
  const previous = useRef(value);
  useEffect(() => {
    if (Object.is(previous.current, value)) return;
    previous.current = value;
    effect();
  });
}
