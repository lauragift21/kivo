import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useSearch } from '@tanstack/react-router';
import {
  FileText,
  Download,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDateForTimezone } from '@kivo/shared';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { publicApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function PublicInvoicePage() {
  const params = useParams({ strict: false });
  const token = (params as any).token;
  const search = useSearch({ from: '/invoice/$token' }) as any;
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-invoice', token],
    queryFn: () => publicApi.getInvoice(token),
  });

  const payMutation = useMutation({
    mutationFn: () => publicApi.pay(token),
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
    },
  });

  // Show success message if payment just completed
  const paymentSuccess = search?.payment === 'success';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-8">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-8 w-48" />
              </div>
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
            <p className="text-muted-foreground">
              This invoice link may be invalid or expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { invoice, client, business, items, can_pay, pdf_url } = data;



  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {paymentSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Payment successful!</p>
              <p className="text-sm text-green-700">Thank you for your payment.</p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">{business.name || 'Invoice'}</h1>
                  <p className="text-sm text-muted-foreground">{invoice.invoice_number}</p>
                </div>
              </div>
              <Badge variant={invoice.status as any} className="text-sm w-fit">
                {invoice.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {/* Business and Client Info */}
            <div className="grid gap-8 sm:grid-cols-2 mb-8">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">From</p>
                <p className="font-medium">{business.name || 'Business'}</p>
                {business.email && <p className="text-muted-foreground">{business.email}</p>}
                {business.address && (
                  <p className="text-muted-foreground whitespace-pre-line">{business.address}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Bill To</p>
                <p className="font-medium">{client.name}</p>
                {client.company && <p className="text-muted-foreground">{client.company}</p>}
                <p className="text-muted-foreground">{client.email}</p>
                {client.address && (
                  <p className="text-muted-foreground whitespace-pre-line">{client.address}</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2 mb-8 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-medium">{formatDateForTimezone(invoice.issue_date, 'UTC')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDateForTimezone(invoice.due_date, 'UTC')}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="text-left py-3">Description</th>
                    <th className="text-right py-3">Qty</th>
                    <th className="text-right py-3">Price</th>
                    <th className="text-right py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="py-4">{item.description}</td>
                      <td className="text-right py-4">{item.quantity}</td>
                      <td className="text-right py-4">
                        {formatCurrency(item.unit_price, invoice.currency)}
                      </td>
                      <td className="text-right py-4 font-medium">
                        {formatCurrency(item.amount, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
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
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{formatCurrency(invoice.discount_amount, invoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-8 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Notes</p>
                <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              {can_pay && (
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => payMutation.mutate()}
                  disabled={payMutation.isPending}
                >
                  {payMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Pay Now
                </Button>
              )}
              {pdf_url && (
                <a href={pdf_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Powered by Kivo
        </p>
      </div>
    </div>
  );
}
