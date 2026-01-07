import { useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Trash2, FileText, Building2, Calendar } from 'lucide-react';
import {
  createInvoiceSchema,
  CURRENCIES,
  PAYMENT_TERMS,
  DISCOUNT_TYPES,
  calculateInvoiceTotals,
  formatCurrency,
} from '@kivo/shared';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { invoicesApi, clientsApi, settingsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type InvoiceFormData = z.infer<typeof createInvoiceSchema>;

export function InvoiceFormPage() {
  const params = useParams({ strict: false });
  const invoiceId = (params as any).id;
  const isEditing = !!invoiceId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list(),
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const { data: invoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: () => invoicesApi.get(invoiceId!),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      currency: 'USD',
      items: [{ description: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch form values for live total calculation
  const watchItems = watch('items');
  const watchDiscountType = watch('discount_type');
  const watchDiscountValue = watch('discount_value');
  const watchCurrency = watch('currency') || 'USD';
  const watchClientId = watch('client_id');

  // Get selected client details
  const selectedClient = clients?.find((c) => c.id === watchClientId);

  // Calculate totals
  const totals = calculateInvoiceTotals(
    watchItems || [],
    watchDiscountType as any,
    watchDiscountValue
  );

  // Set defaults from settings
  useEffect(() => {
    if (settings && !isEditing) {
      setValue('currency', settings.default_currency);
      setValue('payment_terms', settings.default_payment_terms);

      // Set default dates
      const today = new Date().toISOString().split('T')[0];
      setValue('issue_date', today);

      // Calculate due date based on payment terms
      const dueDate = new Date();
      const days =
        {
          due_on_receipt: 0,
          net_7: 7,
          net_14: 14,
          net_30: 30,
          net_60: 60,
          net_90: 90,
        }[settings.default_payment_terms] || 30;
      dueDate.setDate(dueDate.getDate() + days);
      setValue('due_date', dueDate.toISOString().split('T')[0]);

      // Generate invoice number
      const invoiceNumber = `${settings.invoice_prefix}-${settings.next_invoice_number.toString().padStart(5, '0')}`;
      setValue('invoice_number', invoiceNumber);
    }
  }, [settings, isEditing, setValue]);

  // Load existing invoice data
  useEffect(() => {
    if (invoice && isEditing) {
      reset({
        client_id: invoice.client_id,
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        currency: invoice.currency,
        discount_type: invoice.discount_type || undefined,
        discount_value: invoice.discount_value || undefined,
        notes: invoice.notes || '',
        payment_terms: invoice.payment_terms || undefined,
        reminders_enabled: invoice.reminders_enabled,
        items:
          invoice.items?.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate,
          })) || [],
      });
    }
  }, [invoice, isEditing, reset]);

  const createMutation = useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: 'Invoice created successfully' });
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceFormData }) =>
      invoicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice updated successfully' });
      navigate({ to: `/invoices/${invoiceId}` });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    if (isEditing) {
      updateMutation.mutate({ id: invoiceId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoadingClients || (isEditing && isLoadingInvoice)) {
    return (
      <AppLayout>
        <PageHeader title={isEditing ? 'Edit Invoice' : 'New Invoice'} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={isEditing ? 'Edit Invoice' : 'New Invoice'}
        description={
          isEditing ? 'Update invoice details' : 'Create a new invoice for your client'
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Invoice Info */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Bill to</CardTitle>
                    <CardDescription>Select the client for this invoice</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="client_id">Client</Label>
                    <Select
                      value={watch('client_id')}
                      onValueChange={(value) => setValue('client_id', value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.company && `(${client.company})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.client_id && (
                      <p className="text-sm text-destructive">{errors.client_id.message}</p>
                    )}
                  </div>
                </div>

                {/* Selected Client Preview */}
                {selectedClient && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <p className="font-medium text-sm">{selectedClient.name}</p>
                    {selectedClient.company && (
                      <p className="text-sm text-muted-foreground">{selectedClient.company}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{selectedClient.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Invoice Details</CardTitle>
                    <CardDescription>Invoice number, dates, and currency</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_number">Invoice Number</Label>
                    <Input id="invoice_number" {...register('invoice_number')} className="h-11" />
                    {errors.invoice_number && (
                      <p className="text-sm text-destructive">{errors.invoice_number.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={watch('currency')}
                      onValueChange={(value) => setValue('currency', value as any)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue_date">Issue Date</Label>
                    <Input
                      id="issue_date"
                      type="date"
                      {...register('issue_date')}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input id="due_date" type="date" {...register('due_date')} className="h-11" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items - Mollie-inspired */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Line Items</CardTitle>
                      <CardDescription>Add products or services</CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Items Header */}
                <div className="hidden sm:grid grid-cols-12 gap-3 mb-2 px-1 text-sm font-medium text-muted-foreground">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">VAT</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const qty = watchItems?.[index]?.quantity || 0;
                    const price = watchItems?.[index]?.unit_price || 0;
                    const lineTotal = qty * price;

                    return (
                      <div
                        key={field.id}
                        className="grid gap-3 sm:grid-cols-12 items-start p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="sm:col-span-5 space-y-1">
                          <Label className="sm:hidden text-xs">Product</Label>
                          <Input
                            placeholder="Service or product description"
                            {...register(`items.${index}.description`)}
                            className="h-10"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="sm:hidden text-xs">Qty</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="1.00"
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            className="h-10"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="sm:hidden text-xs">Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                            className="h-10"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="sm:hidden text-xs">VAT %</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0"
                            {...register(`items.${index}.tax_rate`, { valueAsNumber: true })}
                            className="h-10"
                          />
                        </div>
                        <div className="sm:col-span-1 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                          <span className="sm:hidden text-sm font-medium">
                            {formatCurrency(lineTotal, watchCurrency)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => fields.length > 1 && remove(index)}
                            disabled={fields.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Discount Section */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid gap-4 sm:grid-cols-3 max-w-md">
                    <div className="space-y-2">
                      <Label>Discount</Label>
                      <Select
                        value={watch('discount_type') || ''}
                        onValueChange={(value) =>
                          setValue('discount_type', (value as any) || null)
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {DISCOUNT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {watchDiscountType && (watchDiscountType as string) !== 'none' && (
                      <div className="space-y-2">
                        <Label>
                          {watchDiscountType === 'percentage' ? 'Discount %' : 'Amount'}
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="h-10"
                          {...register('discount_value', { valueAsNumber: true })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Notes</CardTitle>
                <CardDescription>Additional information for the client</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="notes"
                  placeholder="Add memo or payment instructions..."
                  rows={4}
                  className="resize-none"
                  {...register('notes')}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Totals Summary */}
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(totals.subtotal, watchCurrency)}
                    </span>
                  </div>
                  {totals.tax_total > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">
                        {formatCurrency(totals.tax_total, watchCurrency)}
                      </span>
                    </div>
                  )}
                  {totals.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-status-settled">
                        -{formatCurrency(totals.discount_amount, watchCurrency)}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold">
                        {formatCurrency(totals.total, watchCurrency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="pt-4 border-t space-y-3">
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Select
                      value={watch('payment_terms') || ''}
                      onValueChange={(value) => setValue('payment_terms', value as any)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-2">
                  <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? 'Saving...' : 'Creating...'}
                      </>
                    ) : isEditing ? (
                      'Save Changes'
                    ) : (
                      'Create Invoice'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => navigate({ to: '/invoices' })}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
