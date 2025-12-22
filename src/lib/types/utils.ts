/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Type alias to check if two types T and U are identical.
 * Resolves to true if T and U are the same, false otherwise.
 */
export type IsSame<T, U> = (<G>() => G extends T ? 1 : 2) extends <
  G
>() => G extends U ? 1 : 2
  ? true
  : false

/**
 * IntersectProps is a type alias that represents the intersection of two types A and B.
 * It extracts the common keys between A and B and creates a new type with those keys,
 * where the values are the same as in A.
 *
 * Example:
 *   type A = { a: string, b: number }
 *   type B = { b: number, c: boolean }
 *   type Intersection = IntersectProps<A, B> // { b: number }
 *
 *   const obj: Intersection = { b: 42 } // valid
 *   const obj2: Intersection = { a: 'hello' } // error, 'a' is not in the intersection
 */
export type CommonPropsWithSameType<A, B> = {
  [K in keyof A & keyof B as IsSame<A[K], B[K]> extends true ? K : never]: A[K]
}

/**
 * Represents an object with a mix of known and unknown keys.
 *
 * The known keys are defined by the type parameter `K` and have values of type `T`.
 * The unknown keys can be any string and also have values of type `T`.
 *
 * Example:
 *   WithKnownKeys<'id' | 'name', string> represents an object like:
 *     { id: '1', name: 'John', occupation: 'Developer' }
 *   where 'id' and 'name' are known keys, and 'occupation' is an unknown key.
 *
 * Example:
 *   WithKnownKeys<'x' | 'y', number> represents an object like:
 *     { x: 10, y: 20, z: 30 }
 *   where 'x' and 'y' are known keys, and 'z' is an unknown key.
 */
export type WithKnownKeys<K extends string, T> = Partial<Record<K, T>> & {
  [key: string]: T
}

/**
 * Type alias that helps native TypeScript IDEs (e.g. VS Code) provide a better preview of the type.
 * It creates a new type identical to the original type T, allowing for improved type introspection.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * Creates a type that includes all properties from type T as optional (possibly null/undefined)
 * while allowing additional string-indexed properties of type Extra.
 *
 * @template T - The base type whose properties should be included
 * @template Extra - The type for additional properties (defaults to any)
 *
 * Examples:
 *
 * // Base interface with known properties
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * // Using LooseShape to create a flexible object type
 * const partialUserWithMetadata: LooseShape<User> = {
 *   id: 123,             // Original property from User
 *   name: null,          // Original property with null value
 *   metadata: "custom",  // Additional property (type 'any' by default)
 *   tags: ["new", "vip"] // Another additional property
 * };
 *
 * // Specifying the extra fields type
 * const userWithStringExtras: LooseShape<User, string> = {
 *   id: 123,
 *   email: undefined,
 *   role: "admin",      // Additional property (must be string)
 *   department: "sales" // Additional property (must be string)
 * };
 */
export type LooseShape<T, Extra = any> = {
  [K in keyof T]?: T[K] | null | undefined
} & {
  [K in Exclude<string, keyof T>]?: Extra
}
