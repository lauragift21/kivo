import { createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';

// Pages
import { DashboardPage } from '@/pages/dashboard';
import { ClientsListPage } from '@/pages/clients/list';
import { ClientFormPage } from '@/pages/clients/form';
import { InvoicesListPage } from '@/pages/invoices/list';
import { InvoiceDetailPage } from '@/pages/invoices/detail';
import { InvoiceFormPage } from '@/pages/invoices/form';
import { SettingsPage } from '@/pages/settings';
import { PublicInvoicePage } from '@/pages/public-invoice';
import { PrivacyPage } from '@/pages/privacy';
import { TermsPage } from '@/pages/terms';

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Redirect root to dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' });
  },
  component: DashboardPage,
});

// Privacy page
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'privacy',
  component: PrivacyPage,
});

// Terms page
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'terms',
  component: TermsPage,
});

// Public invoice route
const publicInvoiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'invoice/$token',
  component: PublicInvoicePage,
  validateSearch: (search: Record<string, unknown>) => ({
    payment: (search.payment as string) || undefined,
  }),
});

// Dashboard
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

// Clients routes
const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'clients',
  component: () => <Outlet />,
});

const clientsIndexRoute = createRoute({
  getParentRoute: () => clientsRoute,
  path: '/',
  component: ClientsListPage,
});

const clientsNewRoute = createRoute({
  getParentRoute: () => clientsRoute,
  path: 'new',
  component: ClientFormPage,
});

const clientsEditRoute = createRoute({
  getParentRoute: () => clientsRoute,
  path: '$id',
  component: ClientFormPage,
});

// Invoices routes
const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'invoices',
  component: () => <Outlet />,
});

const invoicesIndexRoute = createRoute({
  getParentRoute: () => invoicesRoute,
  path: '/',
  component: InvoicesListPage,
});

const invoicesNewRoute = createRoute({
  getParentRoute: () => invoicesRoute,
  path: 'new',
  component: InvoiceFormPage,
});

const invoicesDetailRoute = createRoute({
  getParentRoute: () => invoicesRoute,
  path: '$id',
  component: InvoiceDetailPage,
});

const invoicesEditRoute = createRoute({
  getParentRoute: () => invoicesRoute,
  path: '$id/edit',
  component: InvoiceFormPage,
});

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'settings',
  component: SettingsPage,
});

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  privacyRoute,
  termsRoute,
  publicInvoiceRoute,
  dashboardRoute,
  clientsRoute.addChildren([clientsIndexRoute, clientsNewRoute, clientsEditRoute]),
  invoicesRoute.addChildren([invoicesIndexRoute, invoicesNewRoute, invoicesDetailRoute, invoicesEditRoute]),
  settingsRoute,
]);

// Create router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Type declaration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
