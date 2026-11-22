/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ControllerRenderProps,
  ControllerFieldState,
} from "react-hook-form";
import type { ValidationRules } from "./rule";

export type FieldResolvedProps = {
  /**
   * The field's path. Not unique on a page (two forms with the same fields
   * share it), so it is not a safe DOM id.
   * @deprecated Use `path` to identify the field. For label association the
   * adapter owns the DOM: `const id = useId()` in the adapter, or put the input
   * inside its `<label>`. Will be removed in 1.0.
   */
  id?: string;

  /**
   * Field name — the key in the form data object, excluding any namespace prefix.
   * e.g. `"firstName"` even when the full path is `"profile.firstName"`.
   */
  name: string;

  /**
   * Full dot-notation path to the field within the form state.
   * e.g. `"profile.firstName"` for a field inside a nested section.
   * Use this when you need to interact with RHF APIs directly (e.g. `setValue`, `trigger`).
   * @advanced
   */
  path: string;

  /**
   * Namespace prefix of the field — the dot-notation path to the parent section, if any.
   * e.g. `"profile"` for a field inside a nested section named `"profile"`.
   * `undefined` for top-level fields.
   * @advanced
   */
  namespace?: string;

  /**
   * The default value registered for this field, as defined in the field config.
   * Provided for reference only — RHF has already applied this value at initialization.
   * @advanced
   */
  defaultValue?: any;

  /**
   * Current value of the field, sourced from RHF's `useController`.
   * Bind this to the input's `value` prop.
   */
  value?: ControllerRenderProps["value"];

  /**
   * Change handler sourced from RHF's `useController`.
   * Pass the value: `onChange(e.target.value)`, `onChange(checked)`. A DOM
   * change event also works (RHF reads `event.target.value` / `checked`), but
   * other events do not, e.g. React Native's (`nativeEvent.text`).
   */
  onChange?: ControllerRenderProps["onChange"];

  /**
   * Blur handler sourced from RHF's `useController`.
   * Call this when the input loses focus to mark the field as touched.
   */
  onBlur?: ControllerRenderProps["onBlur"];

  /**
   * Ref sourced from RHF's `useController`.
   * Attach it to anything with a `focus()` method (a DOM input, a React Native
   * `TextInput`, a UI library input) to enable focus on validation error and
   * `form.setFocus()`.
   */
  ref?: ControllerRenderProps["ref"];

  /**
   * Human-readable error message, derived from `error.message` and passed through
   * the i18n pipeline if `i18nConfig` is configured.
   * Use this to render the error state in the field UI.
   * `undefined` when the field has no error.
   */
  errorMessage?: string;

  /**
   * Raw RHF field error object, sourced from `useController`'s `fieldState.error`.
   * Use this when you need to branch on `error.type` (e.g. `"required"` vs `"minLength"`).
   * For most cases, `errorMessage` is sufficient.
   */
  error?: ControllerFieldState["error"];

  /**
   * Whether the field currently has a validation error.
   * Derived from `!!error`. Equivalent to `Boolean(errorMessage)`.
   * Useful as a shorthand for toggling error styles without checking the message string.
   */
  invalid?: ControllerFieldState["invalid"];

  /**
   * Whether the field value has been modified from its default value.
   * Sourced from RHF's `fieldState.isDirty`.
   */
  isDirty?: ControllerFieldState["isDirty"];

  /**
   * Whether the field has been interacted with (focused and blurred).
   * Sourced from RHF's `fieldState.isTouched`.
   */
  isTouched?: ControllerFieldState["isTouched"];

  /**
   * Whether the field is currently being validated asynchronously.
   * Sourced from RHF's `fieldState.isValidating`.
   */
  isValidating?: ControllerFieldState["isValidating"];

  /**
   * Translated label text for the field, sourced from the field config.
   * Pass through the i18n pipeline if `i18nConfig` is configured.
   */
  label?: string;

  /**
   * Translated description text for the field, sourced from the field config.
   * Typically rendered as helper text below the input.
   */
  description?: string;

  /**
   * Whether the field is required.
   * Derived from the field's `rules.required` config.
   * Use this to render a required indicator (e.g. asterisk) in the field label.
   */
  required?: boolean;

  /**
   * Validation rules applied to this field, compatible with RHF's `useController` rules.
   * Provided for reference — BlueForm applies these internally.
   * @advanced
   */
  rules?: ValidationRules;

  /**
   * Whether the field is read-only.
   * When `true`, the field should be rendered in a non-editable state
   * but still visible and included in the submission payload.
   */
  readOnly?: boolean;

  /**
   * Whether the field is disabled.
   * Reflects the merged result of the field-level `disabled` config and
   * the form-level `disabled` state from RHF (`useForm({ disabled })`).
   * When `true`, the field is non-interactive and excluded from the submission payload.
   */
  disabled?: boolean;

  /**
   * Whether the field is visible. Always `true` in an adapter or `render`: a
   * hidden field is not rendered at all (and with `shouldUnregister` its value
   * leaves the form state).
   */
  visible?: boolean;
};
