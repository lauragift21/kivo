import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Kivo Button Component
 * 
 * Design principles:
 * - Black and white theme
 * - Subtle orange on hover (not overwhelming)
 * - Simple and clear
 * - Medium font weight, not bold
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        /* Primary: Black button - stays black, subtle lift on hover */
        default: 'bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] shadow-sm hover:shadow-md',
        
        /* Destructive: Red - for delete actions */
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]',
        
        /* Outline: Border - subtle hover */
        outline: 'border border-input bg-background hover:bg-secondary active:scale-[0.98]',
        
        /* Secondary: Light gray background */
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',
        
        /* Ghost: No background - for subtle interactions */
        ghost: 'hover:bg-secondary hover:text-foreground',
        
        /* Link: Text only - for inline actions */
        link: 'text-foreground underline-offset-4 hover:underline',

        /* Accent: Subtle orange - use sparingly */
        accent: 'bg-accent/90 text-white hover:bg-accent active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-base',
        icon: 'h-10 w-10',
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
