// G5: consumer type checks against the built declarations (see CONTRIBUTING.md).
import { setupForm } from "react-headless-form";
const Text = (_: { placeholder?: string }) => null;
const [, dc] = setupForm({ fieldMapping: { text: Text } });
type M = { users: { name: string }[]; addr: { city: string }; h: string };
dc<M>({
  users: { type: "array", render: ({ append, renderItems }) => <>{renderItems()}<b onClick={() => append({ name: "a" })} /></> },
  addr: { type: "section", render: ({ children }) => <i>{children}</i> },
  h: { type: "hidden" },
});
