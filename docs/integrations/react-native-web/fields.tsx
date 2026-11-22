import type { ReactNode } from 'react'
import { type AdapterProps, useField } from 'react-headless-form'
import {
  Pressable,
  Switch,
  type SwitchProps,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from 'react-native'

// No DOM form controls in React Native: label and message are <Text>
function FieldShell({ children }: { children: ReactNode }) {
  const { label, errorMessage, required } = useField()
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required && ' *'}
      </Text>
      {children}
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
    </View>
  )
}

// AdapterProps: TextInput's own props minus what useField() controls, and what is set below
export type TextFieldProps = AdapterProps<TextInputProps, 'editable' | 'onChangeText'>

function TextField(props: TextFieldProps) {
  const { value, onChange, onBlur, label, errorMessage, disabled, readOnly } = useField()
  return (
    <FieldShell>
      <TextInput
        placeholderTextColor="#94a3b8"
        {...props}
        accessibilityLabel={typeof label === 'string' ? label : undefined}
        value={value == null ? '' : String(value)}
        onChangeText={text => onChange(text)} // the text, not an event
        onBlur={onBlur}
        editable={!disabled && !readOnly}
        style={[styles.input, errorMessage ? styles.inputError : null, (disabled || readOnly) && styles.inputMuted, props.style]}
      />
    </FieldShell>
  )
}

/** No native select on the web build: a row of options. */
export type SelectFieldProps = AdapterProps<ViewProps> & { options: { value: string; label: string }[] }

function SelectField({ options, ...props }: SelectFieldProps) {
  const { value, onChange, disabled } = useField()
  return (
    <FieldShell>
      <View {...props} style={[styles.segments, props.style]}>
        {options.map(option => (
          <Pressable
            key={option.value}
            aria-checked={option.value === value}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={[styles.segment, option.value === value && styles.segmentActive]}
          >
            <Text style={option.value === value ? styles.segmentTextActive : undefined}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    </FieldShell>
  )
}

export type CheckboxFieldProps = AdapterProps<SwitchProps, 'onValueChange'>

function CheckboxField(props: CheckboxFieldProps) {
  const { value, onChange, label, disabled } = useField()
  return (
    <View style={[styles.field, styles.row]}>
      <Switch {...props} value={Boolean(value)} onValueChange={next => onChange(next)} disabled={disabled} />
      <Text onPress={() => !disabled && onChange(!value)}>{label}</Text>
    </View>
  )
}

export const fields = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}

// Plain style objects: React Native Web accepts them as `style`
const styles = {
  field: { flexGrow: 1, flexBasis: 260, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontWeight: '600' },
  error: { color: '#dc2626', fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 },
  inputError: { borderColor: '#dc2626' },
  inputMuted: { backgroundColor: '#f1f5f9' },
  segments: { flexDirection: 'row', gap: 6 },
  segment: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 },
  segmentActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  segmentTextActive: { color: '#fff' },
} as const
