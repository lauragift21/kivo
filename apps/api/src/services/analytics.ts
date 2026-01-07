import { createLogger } from '../utils/logger';
import type { AnalyticsEvent } from '@kivo/shared';
import { ANALYTICS_EVENTS } from '@kivo/shared';

export class AnalyticsService {
  private logger;

  constructor() {
    this.logger = createLogger();
  }

  /**
   * Track an analytics event
   * In production, this could send to a dedicated analytics service
   */
  track(event: AnalyticsEvent): void {
    // Log as structured JSON for observability
    this.logger.info('Analytics event', {
      event: event.event,
      userId: event.user_id,
      properties: event.properties,
      timestamp: event.timestamp,
    });
  }

  /**
   * Track client creation
   */
  trackClientCreated(userId: string, clientId: string): void {
    this.track({
      event: ANALYTICS_EVENTS.CLIENT_CREATED,
      user_id: userId,
      properties: { client_id: clientId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track invoice creation
   */
  trackInvoiceCreated(userId: string, invoiceId: string, total: number, currency: string): void {
    this.track({
      event: ANALYTICS_EVENTS.INVOICE_CREATED,
      user_id: userId,
      properties: { invoice_id: invoiceId, total, currency },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track invoice sent
   */
  trackInvoiceSent(userId: string, invoiceId: string): void {
    this.track({
      event: ANALYTICS_EVENTS.INVOICE_SENT,
      user_id: userId,
      properties: { invoice_id: invoiceId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track invoice viewed
   */
  trackInvoiceViewed(userId: string, invoiceId: string): void {
    this.track({
      event: ANALYTICS_EVENTS.INVOICE_VIEWED,
      user_id: userId,
      properties: { invoice_id: invoiceId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track invoice paid
   */
  trackInvoicePaid(userId: string, invoiceId: string, amount: number, currency: string): void {
    this.track({
      event: ANALYTICS_EVENTS.INVOICE_PAID,
      user_id: userId,
      properties: { invoice_id: invoiceId, amount, currency },
      timestamp: new Date().toISOString(),
    });
  }
}
