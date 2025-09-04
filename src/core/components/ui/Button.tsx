import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/core/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive trans-c",
  {
    variants: {
      variant: {
        default:
          'text-btn-foreground font-semibold bg-btn-background hover:text-btn-foreground-hover hover:bg-btn-background-hover',
        accent:
          'text-btn-accent-foreground font-semibold bg-btn-accent-background hover:text-btn-accent-foreground-hover hover:bg-btn-accent-background-hover duration-500',
        secondary:
          'text-btn-secondary-foreground bg-btn-secondary-background hover:text-btn-secondary-foreground-hover hover:bg-btn-secondary-background-hover shadow-xs dark:shadow-none',
        outline:
          'border border-border text-muted hover:border-transparent hover:bg-btn-secondary-background hover:text-foreground',
        ghost:
          'text-btn-secondary-foreground hover:bg-btn-secondary-background',
      },
      size: {
        default: 'h-11 px-4 has-[>svg]:px-3',
        sm: 'h-8 text-xs gap-1.5 px-4 has-[>svg]:px-2.5',
        lg: 'h-14 px-8 has-[>svg]:px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, loading, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={loading}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
