import { createLogger } from '../utils/logger';
import type { AnalyticsEvent } from '@kivo/shared';
import { ANALYTICS_EVENTS } from '@kivo/shared';

export class AnalyticsService {
  private logger;

  constructor() {
    this.logger = createLogger();
  }

  track(event: AnalyticsEvent): void {
    this.logger.info('Analytics event', {
      event: event.event,
      properties: event.properties,
      timestamp: event.timestamp,
    });
  }

  trackClientCreated(clientId: string): void {
    this.track({
      event: ANALYTICS_EVENTS.CLIENT_CREATED,
      properties: { client_id: clientId },
      timestamp: new Date().toISOString(),
    });
  }

  trackInvoiceCreated(invoiceId: string, total: number, currency: string): void {
    this.track({
      event: ANALYTICS_EVENTS.INVOICE_CREATED,
      properties: { invoice_id: invoiceId, total, currency },
      timestamp: new Date().toISOString(),
    });
  }

  trackInvoiceSent(invoiceId: string): void {
    this.track({
      event: ANALYTICS_EVENTS.INVOICE_SENT,
      properties: { invoice_id: invoiceId },
      timestamp: new Date().toISOString(),
    });
  }

  trackInvoiceViewed(invoiceId: string): void {
    this.track({
      event: ANALYTICS_EVENTS.INVOICE_VIEWED,
      properties: { invoice_id: invoiceId },
      timestamp: new Date().toISOString(),
    });
  }

  trackInvoicePaid(invoiceId: string, amount: number, currency: string): void {
    this.track({
      event: ANALYTICS_EVENTS.INVOICE_PAID,
      properties: { invoice_id: invoiceId, amount, currency },
      timestamp: new Date().toISOString(),
    });
  }
}
