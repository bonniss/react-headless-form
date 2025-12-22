export type UserProfile = {
  id: string
  name: string
  email: string
  password?: string
  role: "user" | "admin"
  active: boolean
  bio?: string
  addresses: {
    street: string
    city: string
  }[]
}
