import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-neutral-950 focus-visible:ring-neutral-950/50 focus-visible:ring-[3px] aria-invalid:ring-red-500/20  aria-invalid:border-red-500 transition-[color,box-shadow] overflow-hidden      ',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-neutral-900  [a&]:hover:bg-neutral-900/90   ',
        secondary: 'border-transparent bg-neutral-100  [a&]:hover:bg-neutral-100/90   ',
        destructive:
          'border-transparent bg-red-500 text-white [a&]:hover:bg-red-500/90 focus-visible:ring-red-500/20       ',
        outline: 'text-neutral-950 [a&]:hover:bg-neutral-100 [a&]:hover:text-neutral-900   ',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
export type BadgeVariants = VariantProps<typeof badgeVariants>
