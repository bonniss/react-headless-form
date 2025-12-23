export type UserProfile = {
  id: string
  name: string
  password?: string
  email: string
  role: "user" | "admin"
  bio?: string
  active: boolean
  settings: {
    newsletter: boolean
    theme: "light" | "dark"
  }
  addresses: {
    street: string
    city: string
  }[]
}
