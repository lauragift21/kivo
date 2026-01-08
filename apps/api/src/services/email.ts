import { ExternalServiceError } from '../utils/errors';
import { createLogger } from '../utils/logger';
import type { Currency } from '@kivo/shared';
import { formatCurrency } from '@kivo/shared';

interface ResendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private logger;

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    this.logger = createLogger();
  }

  private async send(options: ResendEmailOptions): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from: options.from || this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error('Failed to send email', new Error(error), { to: options.to });
      throw new ExternalServiceError('Resend', `Failed to send email: ${error}`);
    }

    this.logger.info('Email sent successfully', { to: options.to, subject: options.subject });
  }

  async sendMagicLink(email: string, token: string, frontendUrl: string): Promise<void> {
    const magicLink = `${frontendUrl}/auth/verify?token=${token}`;
    
    await this.send({
      to: email,
      subject: 'Sign in to Kivo',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0;">Kivo</h1>
          </div>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">Sign in to your account</h2>
            <p style="color: #6b7280; margin: 0 0 20px 0;">Click the button below to sign in to Kivo. This link will expire in 15 minutes.</p>
            
            <a href="${magicLink}" style="display: inline-block; background: #6366F1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">Sign in</a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">If you did not request this email, you can safely ignore it.</p>
        </body>
        </html>
      `,
    });
  }

  async sendInvoice(
    to: string,
    invoiceNumber: string,
    businessName: string,
    total: number,
    currency: Currency,
    dueDate: string,
    publicUrl: string,
    fromName?: string
  ): Promise<void> {
    await this.send({
      to,
      from: fromName ? `${fromName} <${this.fromEmail}>` : this.fromEmail,
      subject: `Invoice ${invoiceNumber} from ${businessName || 'Kivo'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0;">${businessName || 'Kivo'}</h1>
          </div>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">Invoice ${invoiceNumber}</h2>
            
            <div style="background: white; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6b7280;">Amount Due</span>
                <span style="color: #1a1a1a; font-weight: 600; font-size: 18px;">${formatCurrency(total, currency)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Due Date</span>
                <span style="color: #1a1a1a;">${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            
            <a href="${publicUrl}" style="display: inline-block; background: #6366F1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">View Invoice</a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">This invoice was sent via Kivo.</p>
        </body>
        </html>
      `,
    });
  }

  async sendReminder(
    to: string,
    invoiceNumber: string,
    businessName: string,
    total: number,
    currency: Currency,
    dueDate: string,
    publicUrl: string,
    reminderType: 'before_due' | 'on_due' | 'after_due',
    fromName?: string
  ): Promise<void> {
    const subjects = {
      before_due: `Reminder: Invoice ${invoiceNumber} is due soon`,
      on_due: `Invoice ${invoiceNumber} is due today`,
      after_due: `Overdue: Invoice ${invoiceNumber} requires attention`,
    };

    const messages = {
      before_due: 'This is a friendly reminder that the following invoice is due soon.',
      on_due: 'This is a reminder that the following invoice is due today.',
      after_due: 'This invoice is now overdue. Please arrange payment at your earliest convenience.',
    };

    await this.send({
      to,
      from: fromName ? `${fromName} <${this.fromEmail}>` : this.fromEmail,
      subject: subjects[reminderType],
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0;">${businessName || 'Kivo'}</h1>
          </div>
          
          <div style="background: ${reminderType === 'after_due' ? '#fef2f2' : '#f9fafb'}; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">Invoice ${invoiceNumber}</h2>
            <p style="color: #6b7280; margin: 0 0 20px 0;">${messages[reminderType]}</p>
            
            <div style="background: white; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6b7280;">Amount Due</span>
                <span style="color: ${reminderType === 'after_due' ? '#dc2626' : '#1a1a1a'}; font-weight: 600; font-size: 18px;">${formatCurrency(total, currency)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Due Date</span>
                <span style="color: ${reminderType === 'after_due' ? '#dc2626' : '#1a1a1a'};">${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            
            <a href="${publicUrl}" style="display: inline-block; background: #6366F1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">View and Pay Invoice</a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">This reminder was sent via Kivo.</p>
        </body>
        </html>
      `,
    });
  }

  async sendPaymentReceipt(
    to: string,
    invoiceNumber: string,
    businessName: string,
    amount: number,
    currency: Currency,
    paidAt: string,
    fromName?: string
  ): Promise<void> {
    await this.send({
      to,
      from: fromName ? `${fromName} <${this.fromEmail}>` : this.fromEmail,
      subject: `Payment received for Invoice ${invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0;">${businessName || 'Kivo'}</h1>
          </div>
          
          <div style="background: #f0fdf4; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="background: #22c55e; color: white; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">✓</div>
            </div>
            
            <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 15px 0; text-align: center;">Payment Received</h2>
            <p style="color: #6b7280; margin: 0 0 20px 0; text-align: center;">Thank you for your payment.</p>
            
            <div style="background: white; border-radius: 6px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6b7280;">Invoice</span>
                <span style="color: #1a1a1a;">${invoiceNumber}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6b7280;">Amount Paid</span>
                <span style="color: #22c55e; font-weight: 600; font-size: 18px;">${formatCurrency(amount, currency)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Date</span>
                <span style="color: #1a1a1a;">${new Date(paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">This receipt was sent via Kivo.</p>
        </body>
        </html>
      `,
    });
  }
}
