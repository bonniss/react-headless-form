import { useId } from 'react'
import { Form, type FormCheckProps, type FormControlProps, type FormSelectProps } from 'react-bootstrap'
import { type AdapterProps, useField } from 'react-headless-form'

// AdapterProps: React-Bootstrap's own props minus what useField() controls (value,
// onChange, label, disabled, ...) and `Extra`, the props this adapter also sets.
// So `props` in the config is typed (and autocompleted) as React-Bootstrap's props.
type Extra = 'id' | 'isInvalid'

export type TextFieldProps = AdapterProps<FormControlProps, Extra>

function TextField(props: TextFieldProps) {
  const id = useId()
  const { value, onChange, onBlur, ref, label, errorMessage, required, disabled, readOnly } = useField()
  return (
    // Form.Group links the label and the control through controlId
    <Form.Group controlId={id}>
      <Form.Label>
        {label}
        {required && ' *'}
      </Form.Label>
      <Form.Control
        {...props}
        ref={ref}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        isInvalid={Boolean(errorMessage)}
        disabled={disabled}
        readOnly={readOnly}
      />
      <Form.Control.Feedback type="invalid">{errorMessage}</Form.Control.Feedback>
    </Form.Group>
  )
}

/** A native select: the `<option>` children come from the config. */
export type SelectFieldProps = AdapterProps<FormSelectProps, Extra>

function SelectField(props: SelectFieldProps) {
  const id = useId()
  const { value, onChange, onBlur, ref, label, errorMessage, disabled } = useField()
  return (
    <Form.Group controlId={id}>
      <Form.Label>{label}</Form.Label>
      <Form.Select
        {...props}
        ref={ref}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        isInvalid={Boolean(errorMessage)}
        disabled={disabled}
      />
      <Form.Control.Feedback type="invalid">{errorMessage}</Form.Control.Feedback>
    </Form.Group>
  )
}

export type CheckboxFieldProps = AdapterProps<FormCheckProps, Extra | 'checked' | 'type'>

function CheckboxField(props: CheckboxFieldProps) {
  const id = useId()
  const { value, onChange, onBlur, ref, label, errorMessage, disabled } = useField()
  return (
    <Form.Check
      {...props}
      id={id}
      ref={ref}
      type="checkbox"
      label={label}
      checked={Boolean(value)}
      onChange={e => onChange(e.target.checked)}
      onBlur={onBlur}
      isInvalid={Boolean(errorMessage)}
      feedback={errorMessage}
      feedbackType="invalid"
      disabled={disabled}
    />
  )
}

export const fields = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}
