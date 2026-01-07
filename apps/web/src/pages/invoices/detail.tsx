import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import {
  Send,
  Download,
  Copy,
  Pencil,
  Eye,
  Loader2,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency, formatDateForTimezone } from '@kivo/shared';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { invoicesApi, settingsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function InvoiceDetailPage() {
  const params = useParams({ strict: false });
  const invoiceId = (params as any).id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: () => invoicesApi.get(invoiceId),
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const sendMutation = useMutation({
    mutationFn: () => invoicesApi.send(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
      toast({
        title: 'Invoice sent',
        description: 'Your client will receive the invoice via email.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => invoicesApi.duplicate(invoiceId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice duplicated' });
      navigate({ to: `/invoices/${data.id}` });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const generatePdfMutation = useMutation({
    mutationFn: () => invoicesApi.generatePdf(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
      toast({ title: 'PDF generated' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const timezone = settings?.timezone || 'Europe/Amsterdam';

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title="Invoice" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-32 mb-4" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Invoice not found</p>
          <Link to="/invoices">
            <Button variant="link">Back to invoices</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const canSend = invoice.status === 'draft';
  const canEdit = invoice.status === 'draft';

  return (
    <AppLayout>
      <PageHeader
        title={invoice.invoice_number}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={invoice.status as any} className="text-sm">
              {invoice.status}
            </Badge>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{formatDateForTimezone(invoice.issue_date, timezone)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDateForTimezone(invoice.due_date, timezone)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{invoice.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Terms</p>
                  <p className="font-medium">
                    {invoice.payment_terms?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{invoice.client?.name}</p>
              {invoice.client?.company && (
                <p className="text-muted-foreground">{invoice.client.company}</p>
              )}
              <p className="text-muted-foreground">{invoice.client?.email}</p>
              {invoice.client?.address && (
                <p className="text-muted-foreground whitespace-pre-line mt-2">
                  {invoice.client.address}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Tax</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item: any) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">{item.description}</td>
                        <td className="text-right py-3">{item.quantity}</td>
                        <td className="text-right py-3">
                          {formatCurrency(item.unit_price, invoice.currency)}
                        </td>
                        <td className="text-right py-3">
                          {item.tax_rate ? `${item.tax_rate}%` : '-'}
                        </td>
                        <td className="text-right py-3 font-medium">
                          {formatCurrency(item.amount, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                {invoice.tax_total > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(invoice.tax_total, invoice.currency)}</span>
                  </div>
                )}
                {invoice.discount_amount && invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Discount
                      {invoice.discount_type === 'percentage' && invoice.discount_value
                        ? ` (${invoice.discount_value}%)`
                        : ''}
                    </span>
                    <span>-{formatCurrency(invoice.discount_amount, invoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {canEdit && (
                <Link to="/invoices/$id/edit" params={{ id: invoiceId }} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Invoice
                  </Button>
                </Link>
              )}
              {canSend && (
                <Button
                  className="w-full justify-start"
                  onClick={() => sendMutation.mutate()}
                  disabled={sendMutation.isPending}
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send to Client
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generatePdfMutation.mutate()}
                disabled={generatePdfMutation.isPending}
              >
                {generatePdfMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Generate PDF
              </Button>
              {invoice.pdf_generated_at && (
                <a
                  href={invoicesApi.getPdfUrl(invoiceId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="mr-2 h-4 w-4" />
                    View PDF
                  </Button>
                </a>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => duplicateMutation.mutate()}
                disabled={duplicateMutation.isPending}
              >
                {duplicateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Duplicate
              </Button>
            </CardContent>
          </Card>

          {/* Activity */}
          {invoice.events && invoice.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.events.slice(0, 10).map((event: any) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {event.event_type === 'paid' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : event.event_type === 'sent' ? (
                          <Send className="h-4 w-4 text-blue-500" />
                        ) : event.event_type === 'viewed' ? (
                          <Eye className="h-4 w-4 text-purple-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {event.event_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateForTimezone(event.created_at, timezone)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payments */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.paid_at
                            ? formatDateForTimezone(payment.paid_at, timezone)
                            : 'Pending'}
                        </p>
                      </div>
                      <Badge
                        variant={payment.status === 'succeeded' ? 'paid' : 'secondary'}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
