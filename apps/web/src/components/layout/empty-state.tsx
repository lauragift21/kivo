import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Kivo EmptyState Component - Mollie-inspired
 *
 * Design principles:
 * - Reassuring copy, not alarming
 * - Short sentences
 * - Clear and direct
 * - No emojis or exclamation points
 * - Clean, minimal visual design
 *
 * Example copy:
 * - Title: "No invoices yet"
 *   Description: "Create your first invoice to get started."
 *
 * - Title: "No clients"
 *   Description: "Add a client to begin invoicing."
 *
 * - Title: "You're all caught up"
 *   Description: "No outstanding invoices at the moment."
 */

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}
