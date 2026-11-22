/**
 * Minimal shadcn/ui-style primitives (Tailwind only, no Radix) so the demo
 * stays light. In a real app these come from `npx shadcn add input label …`.
 */
import type { ComponentProps } from 'react'

const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ')

const control =
  'flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50 aria-invalid:border-red-500'

export const Input = ({ className, ...props }: ComponentProps<'input'>) => (
  <input className={cn(control, 'h-9', className)} {...props} />
)

export const Textarea = ({ className, ...props }: ComponentProps<'textarea'>) => (
  <textarea className={cn(control, 'min-h-16', className)} {...props} />
)

export const NativeSelect = ({ className, ...props }: ComponentProps<'select'>) => (
  <select className={cn(control, 'h-9', className)} {...props} />
)

export const Checkbox = ({ className, ...props }: ComponentProps<'input'>) => (
  <input type="checkbox" className={cn('size-4 accent-zinc-900', className)} {...props} />
)

export const Label = ({ className, ...props }: ComponentProps<'label'>) => (
  <label className={cn('text-sm font-medium leading-none', className)} {...props} />
)

export const Button = ({
  className,
  variant = 'default',
  ...props
}: ComponentProps<'button'> & { variant?: 'default' | 'outline' | 'ghost' }) => (
  <button
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium',
      variant === 'default' && 'bg-zinc-900 text-white hover:bg-zinc-800',
      variant === 'outline' && 'border border-zinc-300 bg-white hover:bg-zinc-50',
      variant === 'ghost' && 'text-red-600 hover:bg-red-50',
      className,
    )}
    {...props}
  />
)

export const Card = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs', className)} {...props} />
)

export const CardTitle = ({ className, ...props }: ComponentProps<'h3'>) => (
  <h3 className={cn('font-semibold leading-none', className)} {...props} />
)
