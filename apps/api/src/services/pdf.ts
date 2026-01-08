import type { InvoiceWithClient, Settings } from '@kivo/shared';
import { formatCurrency, formatDateForTimezone } from '@kivo/shared';

// PDF generation using Cloudflare Browser Rendering API
// Falls back to HTML if the API is unavailable

export interface PDFResult {
  body: ReadableStream | ArrayBuffer;
  contentType: string;
  filename: string;
}

export class PDFService {
  private storage: R2Bucket;
  private accountId: string;
  private apiToken: string;

  constructor(storage: R2Bucket, accountId: string, apiToken: string) {
    this.storage = storage;
    this.accountId = accountId;
    this.apiToken = apiToken;
  }

  /**
   * Generate a PDF for an invoice using Cloudflare Browser Rendering API
   * Falls back to HTML if the API call fails
   */
  async generateInvoicePDF(
    invoice: InvoiceWithClient,
    settings: Settings
  ): Promise<{ data: ArrayBuffer; isPdf: boolean }> {
    const html = this.generateInvoiceHTML(invoice, settings);

    // Try Browser Rendering API first
    if (this.accountId && this.apiToken) {
      try {
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/browser-rendering/pdf`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              html,
              pdfOptions: {
                format: 'a4',
                printBackground: true,
                margin: {
                  top: '20px',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                },
              },
            }),
          }
        );

        if (response.ok) {
          const pdfBuffer = await response.arrayBuffer();
          return { data: pdfBuffer, isPdf: true };
        }

        // Log error but continue to fallback
        console.error('Browser Rendering API error:', response.status, await response.text());
      } catch (error) {
        console.error('Browser Rendering API failed:', error);
      }
    }

    // Fallback to HTML
    console.warn('Falling back to HTML generation');
    const encoder = new TextEncoder();
    return { data: encoder.encode(html).buffer as ArrayBuffer, isPdf: false };
  }

  /**
   * Generate invoice HTML template
   */
  private generateInvoiceHTML(
    invoice: InvoiceWithClient,
    settings: Settings
  ): string {
    const timezone = settings.timezone || 'Europe/Amsterdam';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1a1a1a;
      background: white;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .logo-section h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .logo-section p {
      color: #6b7280;
      font-size: 13px;
    }
    
    .invoice-info {
      text-align: right;
    }
    
    .invoice-number {
      font-size: 28px;
      font-weight: 700;
      color: #10B981;
      margin-bottom: 8px;
    }
    
    .invoice-dates {
      color: #6b7280;
      font-size: 13px;
    }
    
    .invoice-dates span {
      display: block;
      margin-bottom: 4px;
    }
    
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    
    .party {
      width: 45%;
    }
    
    .party-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    
    .party-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .party-details {
      color: #6b7280;
      font-size: 13px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table th {
      background: #f9fafb;
      padding: 12px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }
    
    .items-table td {
      padding: 16px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .item-description {
      font-weight: 500;
    }
    
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    
    .totals-table {
      width: 280px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #6b7280;
    }
    
    .totals-row.total {
      border-top: 2px solid #e5e7eb;
      margin-top: 8px;
      padding-top: 16px;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-draft { background: #f3f4f6; color: #6b7280; }
    .status-sent { background: #dbeafe; color: #2563eb; }
    .status-viewed { background: #ede9fe; color: #8B5CF6; }
    .status-paid { background: #dcfce7; color: #16a34a; }
    .status-overdue { background: #fff7ed; color: #F97316; }
    .status-void { background: #f1f5f9; color: #64748b; }
    
    .notes {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .notes-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    
    .notes-content {
      color: #4b5563;
      font-size: 13px;
    }
    
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <h1>${settings.business_name || 'Kivo'}</h1>
      ${settings.business_email ? `<p>${settings.business_email}</p>` : ''}
      ${settings.business_address ? `<p>${settings.business_address.replace(/\n/g, '<br>')}</p>` : ''}
    </div>
    <div class="invoice-info">
      <div class="invoice-number">${invoice.invoice_number}</div>
      <div class="invoice-dates">
        <span>Issue Date: ${formatDateForTimezone(invoice.issue_date, timezone)}</span>
        <span>Due Date: ${formatDateForTimezone(invoice.due_date, timezone)}</span>
      </div>
      <div style="margin-top: 12px;">
        <span class="status-badge status-${invoice.status}">${invoice.status}</span>
      </div>
    </div>
  </div>
  
  <div class="parties">
    <div class="party">
      <div class="party-label">From</div>
      <div class="party-name">${settings.business_name || 'Your Business'}</div>
      <div class="party-details">
        ${settings.business_email || ''}<br>
        ${settings.business_address ? settings.business_address.replace(/\n/g, '<br>') : ''}
      </div>
    </div>
    <div class="party">
      <div class="party-label">Bill To</div>
      <div class="party-name">${invoice.client.name}</div>
      <div class="party-details">
        ${invoice.client.company ? `${invoice.client.company}<br>` : ''}
        ${invoice.client.email}<br>
        ${invoice.client.address ? invoice.client.address.replace(/\n/g, '<br>') : ''}
      </div>
    </div>
  </div>
  
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 50%">Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Tax</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => `
        <tr>
          <td class="item-description">${item.description}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unit_price, invoice.currency)}</td>
          <td>${item.tax_rate ? `${item.tax_rate}%` : '-'}</td>
          <td>${formatCurrency(item.amount, invoice.currency)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="totals">
    <div class="totals-table">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
      </div>
      ${invoice.tax_total > 0 ? `
        <div class="totals-row">
          <span>Tax</span>
          <span>${formatCurrency(invoice.tax_total, invoice.currency)}</span>
        </div>
      ` : ''}
      ${invoice.discount_amount && invoice.discount_amount > 0 ? `
        <div class="totals-row">
          <span>Discount${invoice.discount_type === 'percentage' && invoice.discount_value ? ` (${invoice.discount_value}%)` : ''}</span>
          <span>-${formatCurrency(invoice.discount_amount, invoice.currency)}</span>
        </div>
      ` : ''}
      <div class="totals-row total">
        <span>Total</span>
        <span>${formatCurrency(invoice.total, invoice.currency)}</span>
      </div>
    </div>
  </div>
  
  ${invoice.notes ? `
    <div class="notes">
      <div class="notes-label">Notes</div>
      <div class="notes-content">${invoice.notes.replace(/\n/g, '<br>')}</div>
    </div>
  ` : ''}
  
  ${invoice.payment_terms ? `
    <div class="notes">
      <div class="notes-label">Payment Terms</div>
      <div class="notes-content">${invoice.payment_terms.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
    </div>
  ` : ''}
  
  <div class="footer">
    <p>Generated by Kivo</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Store PDF in R2
   */
  async storePDF(
    userId: string,
    invoiceId: string,
    invoiceNumber: string,
    pdfData: ArrayBuffer,
    isPdf: boolean
  ): Promise<string> {
    const extension = isPdf ? 'pdf' : 'html';
    const contentType = isPdf ? 'application/pdf' : 'text/html';
    const key = `${userId}/invoices/${invoiceId}/${invoiceNumber}.${extension}`;
    
    await this.storage.put(key, pdfData, {
      httpMetadata: {
        contentType,
        contentDisposition: `inline; filename="${invoiceNumber}.${extension}"`,
      },
    });

    return key;
  }

  /**
   * Get PDF from R2
   * Tries PDF first, then falls back to HTML for legacy files
   */
  async getPDF(userId: string, invoiceId: string, invoiceNumber: string): Promise<PDFResult | null> {
    // Try PDF first
    const pdfKey = `${userId}/invoices/${invoiceId}/${invoiceNumber}.pdf`;
    let file = await this.storage.get(pdfKey);
    
    if (file) {
      return {
        body: file.body,
        contentType: 'application/pdf',
        filename: `${invoiceNumber}.pdf`,
      };
    }

    // Fall back to HTML for legacy files
    const htmlKey = `${userId}/invoices/${invoiceId}/${invoiceNumber}.html`;
    file = await this.storage.get(htmlKey);
    
    if (file) {
      return {
        body: file.body,
        contentType: 'text/html',
        filename: `${invoiceNumber}.html`,
      };
    }

    return null;
  }

  /**
   * Delete PDF from R2 (both PDF and HTML versions)
   */
  async deletePDF(userId: string, invoiceId: string, invoiceNumber: string): Promise<void> {
    const pdfKey = `${userId}/invoices/${invoiceId}/${invoiceNumber}.pdf`;
    const htmlKey = `${userId}/invoices/${invoiceId}/${invoiceNumber}.html`;
    
    await Promise.all([
      this.storage.delete(pdfKey),
      this.storage.delete(htmlKey),
    ]);
  }

  /**
   * Generate a signed URL for PDF download
   */
  getDownloadURL(key: string, apiUrl: string, token: string): string {
    return `${apiUrl}/api/invoices/pdf/${encodeURIComponent(key)}?token=${token}`;
  }
}
