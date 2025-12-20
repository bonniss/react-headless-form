import { FieldErrors } from 'react-hook-form'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function findFirstErrorField(errorObj: FieldErrors): string | null {
  const queue: any[] = [errorObj]

  while (queue.length > 0) {
    const current = queue.shift()

    if (Array.isArray(current)) {
      queue.push(...current)
    } else if (typeof current === 'object' && current !== null) {
      if ('ref' in current && current.ref?.name) {
        return current.ref.name
      }
      Object.values(current).forEach((val) => queue.push(val))
    }
  }

  return null
}
