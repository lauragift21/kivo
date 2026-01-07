import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Kivo Badge Component - Mollie-inspired
 *
 * Design principles:
 * - Clean, pill-shaped badges with subtle backgrounds
 * - Consistent sizing and padding
 * - Status colors that are readable and not overwhelming
 *
 * Status terminology per brand guidelines:
 * - "Settled" instead of "Paid"
 * - "Outstanding" for unpaid invoices
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive/10 text-destructive',
        outline: 'text-foreground border border-border bg-transparent',

        /* Kivo Invoice Status Variants - Mollie-inspired clean style */

        /* Draft: Neutral gray - invoice not yet sent */
        draft: 'bg-muted text-muted-foreground',

        /* Sent: Primary color - invoice delivered to client */
        sent: 'bg-primary/10 text-primary',

        /* Viewed: Primary color with different shade - client has opened the invoice */
        viewed: 'bg-primary/10 text-primary',

        /* Outstanding: Soft amber - payment is due (replaces generic "unpaid") */
        outstanding: 'bg-status-overdue/10 text-status-overdue',

        /* Overdue: Vibrant orange/red - past due date */
        overdue: 'bg-status-overdue/10 text-status-overdue font-semibold',

        /* Settled: Fresh green - payment received (replaces "paid") */
        settled: 'bg-status-settled/10 text-status-settled',

        /* Void: Neutral gray - cancelled invoice */
        void: 'bg-muted text-muted-foreground',

        /* Legacy alias for backwards compatibility */
        paid: 'bg-status-settled/10 text-status-settled',

        /* Open status like Mollie uses */
        open: 'bg-primary/10 text-primary',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
