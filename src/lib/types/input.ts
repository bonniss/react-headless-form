/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react"
import type { ValidationRules } from "./rule"

export type FieldResolvedProps<
  ValueType = any,
  OnChangeType = (...event: any[]) => void
> = {
  id?: string

  /**
   * Field name – the key in the form data object (excluding namespace)
   */
  name: string

  /**
   * Full path to the field within the form data (e.g. "phieuKham.bmi")
   */
  path: string

  /**
   * Field namespace – used to scope the field within nested form data (e.g. "phieuKham")
   */
  namespace?: string

  /**
   * Default value for the field. Same one in the field config.
   */
  defaultValue?: ValueType

  /**
   * Field value, get from RHF `useController`
   */
  value?: ValueType

  /**
   * Field change event handler, get from RHF `useController`
   */
  onChange?: OnChangeType

  /**
   * Auto-translated error message of `error`
   */
  errorMessage?: string

  /**
   * Translated label
   */
  label?: string

  /**
   * Translated description
   */
  description?: string

  /**
   * Is field required? calculated from rules
   */
  required?: boolean

  /**
   * Validation rules applied to this field (compatible with React Hook Form).
   */
  rules?: ValidationRules

  /**
   * Is field read-only?
   */
  readOnly?: boolean

  /**
   * Fallback content to display when a field has no value and the form is in read-only mode.
   * Triggered for values that are `null`, `undefined`, or empty strings.
   *
   * Instead of rendering an empty input or textarea, this fallback will be shown
   * (e.g. `"No data available"`).
   */
  readOnlyEmptyFallback?: ReactNode

  /**
   * Is field disabled?
   */
  disabled?: boolean

  /**
   * Whether the field is visible or not.
   */
  visible?: boolean
}
