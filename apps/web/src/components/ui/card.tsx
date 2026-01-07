import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Kivo Card Component
 *
 * Design principles:
 * - Clean, minimal borders
 * - No gradients - simple and professional
 * - Smooth transitions on hover
 * - Orange accent on interactive states
 */

const cardVariants = cva(
  'rounded-xl text-card-foreground transition-all duration-200',
  {
    variants: {
      variant: {
        /* Default: Clean card with subtle shadow */
        default: 'border bg-card shadow-sm',

        /* Elevated: More prominent shadow for emphasis */
        elevated: 'border bg-card shadow-md hover:shadow-lg',

        /* Ghost: No background, minimal styling */
        ghost: 'bg-transparent',

        /* Interactive: For clickable cards - orange border on hover */
        interactive:
          'border bg-card shadow-sm hover:shadow-md hover:border-accent/30 cursor-pointer active:scale-[0.99]',

        /* Feature: Feature highlight card */
        feature:
          'border bg-card shadow-sm hover:shadow-md hover:border-accent/30 group transition-all',

        /* Stat: For KPI/statistic cards */
        stat: 'border bg-card shadow-sm relative overflow-hidden',

        /* Muted: Subtle background for secondary content */
        muted: 'bg-muted/50 border-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
