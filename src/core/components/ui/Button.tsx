import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/core/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'text-btn-foreground font-semibold bg-btn-background hover:bg-btn-background-hover',
        accent:
          'text-accent-foreground font-semibold bg-accent hover:bg-accent/85',
        secondary:
          'text-btn-secondary-foreground bg-btn-secondary-background hover:bg-btn-secondary-background-hover',
        outline:
          'border border-border text-btn-secondary-foreground hover:bg-btn-secondary-background hover:text-foreground',
        ghost:
          'hover:bg-btn-secondary-background hover:text-btn-secondary-foreground',
        action: 'opacity-60 hover:opacity-100 transition-opacity',
      },
      size: {
        default: 'h-12 px-6 has-[>svg]:px-3',
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
