import { Button, View } from 'react-native'
import { mountDemo } from '../shared/mount'
import { Form, buildConfig, defaultValues } from './form'

// The demo stage around the form: header controls drawn with React Native components.
// There is no <form> to bind with `form=`, so the header button calls onSubmit.
mountDemo(
  { Form, buildConfig, defaultValues },
  {
    SubmitButton: ({ onSubmit, children }) => <Button title={String(children)} onPress={onSubmit} />,
    LanguageSwitch: ({ value, options, onChange }) => (
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {options.map(option => (
          <Button
            key={option.value}
            title={option.label}
            color={option.value === value ? '#2563eb' : '#94a3b8'}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    ),
  },
)
