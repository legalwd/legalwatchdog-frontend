import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary: 'btn--default',
      secondary: 'btn--secondary',
      link: 'btn--link',
      // Legacy aliases to avoid breaking existing usage
      default: 'btn--default',
      outline: 'btn--secondary',
      ghost: 'btn--secondary',
      destructive:
        'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20',
    },
    size: {
      sm: 'btn--sm',
      md: 'btn--md',
      lg: 'btn--lg',
      xl: 'btn--xl',
      // Legacy sizes kept for compatibility
      default: 'btn--md',
      icon: 'size-9',
      'icon-sm': 'size-8',
      'icon-lg': 'size-10',
    },
    layout: {
      default: '',
      'with-icon': 'btn--with-icon',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    layout: 'default',
  },
})
export type ButtonVariants = VariantProps<typeof buttonVariants>
