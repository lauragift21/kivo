import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Plus, FileText, Search, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@kivo/shared';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/layout/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { invoicesApi, clientsApi } from '@/lib/api';
import { INVOICE_STATUSES } from '@kivo/shared';

function getDueDateDisplay(dueDate: string, status: string) {
  if (status === 'settled' || status === 'paid' || status === 'void' || status === 'draft') {
    return { text: '-', className: 'text-muted-foreground' };
  }

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      text: `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`,
      className: 'text-status-overdue font-medium',
    };
  } else if (diffDays === 0) {
    return { text: 'Due today', className: 'text-status-overdue font-medium' };
  } else if (diffDays <= 7) {
    return {
      text: `${diffDays} day${diffDays === 1 ? '' : 's'} left`,
      className: 'text-foreground',
    };
  } else {
    return {
      text: `${diffDays} days left`,
      className: 'text-muted-foreground',
    };
  }
}

export function InvoicesListPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', statusFilter, clientFilter],
    queryFn: () =>
      invoicesApi.list({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        client_id: clientFilter !== 'all' ? clientFilter : undefined,
        limit: 50,
      }),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list(),
  });

  const invoices = invoicesData?.data || [];

  // Filter by search query
  const filteredInvoices = invoices.filter((invoice: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoice_number?.toLowerCase().includes(query) ||
      invoice.client_name?.toLowerCase().includes(query)
    );
  });

  return (
    <AppLayout>
      <PageHeader
        title="Invoices"
        description="Create and manage your invoices"
        actions={
          <Link to="/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {INVOICE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            {/* Table Header Skeleton */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b bg-muted/30">
              <Skeleton className="h-4 w-16 col-span-2" />
              <Skeleton className="h-4 w-12 col-span-2" />
              <Skeleton className="h-4 w-10 col-span-2" />
              <Skeleton className="h-4 w-20 col-span-3" />
              <Skeleton className="h-4 w-16 col-span-3" />
            </div>
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-12 sm:col-span-2">
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="col-span-6 sm:col-span-3 text-right">
                    <Skeleton className="h-5 w-20 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={FileText}
              title="No invoices found"
              description={
                statusFilter !== 'all' || clientFilter !== 'all' || searchQuery
                  ? 'Try adjusting your filters'
                  : 'Create your first invoice to get started'
              }
              action={
                <Link to="/invoices/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Invoice
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
              <div className="col-span-2">Number</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Due</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>

            {/* Table Body */}
            <div className="divide-y">
              {filteredInvoices.map((invoice: any) => {
                const dueDisplay = getDueDateDisplay(invoice.due_date, invoice.status);
                return (
                  <Link
                    key={invoice.id}
                    to="/invoices/$id"
                    params={{ id: invoice.id }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/50 transition-colors group"
                  >
                    {/* Invoice Number */}
                    <div className="col-span-12 sm:col-span-2">
                      <span className="font-medium text-foreground">
                        {invoice.invoice_number}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-6 sm:col-span-2">
                      <Badge variant={invoice.status as any} className="capitalize">
                        {invoice.status}
                      </Badge>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-6 sm:col-span-2">
                      <span className={`text-sm ${dueDisplay.className}`}>
                        {dueDisplay.text}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="col-span-6 sm:col-span-3">
                      <span className="text-sm text-foreground truncate block">
                        {invoice.client_name || 'Unknown client'}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="col-span-6 sm:col-span-3 flex items-center justify-end gap-2">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {invoicesData?.pagination && invoicesData.pagination.total_pages > 1 && (
        <div className="flex justify-center mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredInvoices.length} of {invoicesData.pagination.total} invoices
          </p>
        </div>
      )}
    </AppLayout>
  );
}
