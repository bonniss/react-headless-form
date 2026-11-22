// Vite aliases react-native to react-native-web (vite.config.ts); the types follow.
declare module 'react-native' {
  export * from 'react-native-web'
}
