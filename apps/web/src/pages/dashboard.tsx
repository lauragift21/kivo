import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  DollarSign,
  AlertTriangle,
  Users,
  FileText,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Zap,
  Send,
  BarChart3,
} from 'lucide-react';
import { formatCurrency } from '@kivo/shared';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi } from '@/lib/api';

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
      text: `${overdueDays}d overdue`,
      className: 'text-status-overdue font-medium',
    };
  } else if (diffDays === 0) {
    return { text: 'Due today', className: 'text-status-overdue font-medium' };
  } else if (diffDays <= 7) {
    return {
      text: `${diffDays}d left`,
      className: 'text-foreground',
    };
  } else {
    return {
      text: `${diffDays}d left`,
      className: 'text-muted-foreground',
    };
  }
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
  });

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="Overview of your invoicing activity"
        actions={
          <Link to="/invoices/new">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Outstanding</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight">
                    {formatCurrency(data?.kpis.total_outstanding || 0, data?.default_currency || 'USD')}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Unpaid invoices</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Paid This Month</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-status-settled">
                    {formatCurrency(data?.kpis.total_paid_this_month || 0, data?.default_currency || 'USD')}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Revenue collected</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-status-settled/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-status-settled" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Overdue</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-status-overdue">
                    {data?.kpis.overdue_count || 0}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Need attention</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-status-overdue/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-status-overdue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Clients</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight">
                    {data?.kpis.total_clients || 0}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Active clients</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights - Mollie style */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="group hover:shadow-kivo-md transition-shadow">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Less time, less effort</h3>
            <p className="text-sm text-muted-foreground">
              Create, edit, and send branded invoices in minutes.
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-kivo-md transition-shadow">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-status-settled/10 flex items-center justify-center mb-4 group-hover:bg-status-settled/20 transition-colors">
              <Send className="h-5 w-5 text-status-settled" />
            </div>
            <h3 className="font-semibold mb-1">Easy links, faster payments</h3>
            <p className="text-sm text-muted-foreground">
              Share payment links to get paid up to 40% faster.
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-kivo-md transition-shadow">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-semibold mb-1">Full control, better tracking</h3>
            <p className="text-sm text-muted-foreground">
              Simplify invoice management with a unified dashboard.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices - Mollie-inspired table style */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
          <Link to="/invoices">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center gap-8">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.recent_invoices.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No invoices yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first invoice to get started
              </p>
              <Link to="/invoices/new">
                <Button variant="outline" size="sm">
                  Create your first invoice
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Number</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Due</div>
                <div className="col-span-3">Customer</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>

              {/* Table Body */}
              <div className="divide-y">
                {data?.recent_invoices.map((invoice: any) => {
                  const dueDisplay = getDueDateDisplay(invoice.due_date, invoice.status);
                  return (
                    <Link
                      key={invoice.id}
                      to="/invoices/$id"
                      params={{ id: invoice.id }}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/50 transition-colors group"
                    >
                      {/* Invoice Number */}
                      <div className="col-span-12 sm:col-span-3">
                        <span className="font-medium">{invoice.invoice_number}</span>
                      </div>

                      {/* Status */}
                      <div className="col-span-4 sm:col-span-2">
                        <Badge variant={invoice.status as any} className="capitalize">
                          {invoice.status}
                        </Badge>
                      </div>

                      {/* Due */}
                      <div className="col-span-4 sm:col-span-2">
                        <span className={`text-sm ${dueDisplay.className}`}>
                          {dueDisplay.text}
                        </span>
                      </div>

                      {/* Customer */}
                      <div className="col-span-4 sm:col-span-3">
                        <span className="text-sm text-muted-foreground truncate block">
                          {invoice.client_name}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-2">
                        <span className="font-semibold">
                          {formatCurrency(invoice.total, invoice.currency)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
