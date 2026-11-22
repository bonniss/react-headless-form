/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseFormWatch } from "react-hook-form";

type Listener = (name: string | undefined) => void;
type Hub = { listeners: Set<Listener>; unsubscribe: () => void };

const hubs = new WeakMap<object, Hub>();

/**
 * One `watch(callback)` per form, shared by every field that listens for
 * value changes (conditions, computes). Each RHF watch subscription copies the
 * form values on every notification, so one subscription per field made a
 * keystroke cost O(fields × form size). Listeners get the raw changed `name`
 * (undefined on reset()) and filter by their own deps.
 */
export function listenToValues(control: object, watch: UseFormWatch<any>, listener: Listener) {
  let hub = hubs.get(control);
  if (!hub) {
    const listeners = new Set<Listener>();
    const subscription = watch((_, { name }) => {
      for (const notify of [...listeners]) notify(name);
    });
    hub = { listeners, unsubscribe: () => subscription.unsubscribe() };
    hubs.set(control, hub);
  }
  hub.listeners.add(listener);
  const current = hub;
  return () => {
    current.listeners.delete(listener);
    if (!current.listeners.size) {
      current.unsubscribe();
      if (hubs.get(control) === current) hubs.delete(control);
    }
  };
}
