import { createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';

// Pages
import { LandingPage } from '@/pages/landing';
import { DashboardPage } from '@/pages/dashboard';
import { SignInPage } from '@/pages/auth/signin';
import { SignUpPage } from '@/pages/auth/signup';
import { VerifyPage } from '@/pages/auth/verify';
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

// Auth routes (public)
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth',
  component: () => <Outlet />,
});

const signInRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'signin',
  beforeLoad: ({ context }) => {
    const { auth } = context as { auth: { isAuthenticated: boolean } };
    if (auth.isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
  component: SignInPage,
});

const signUpRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'signup',
  beforeLoad: ({ context }) => {
    const { auth } = context as { auth: { isAuthenticated: boolean } };
    if (auth.isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
  component: SignUpPage,
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth/verify',
  component: VerifyPage,
});

// Landing page (public)
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

// Privacy page (public)
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'privacy',
  component: PrivacyPage,
});

// Terms page (public)
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'terms',
  component: TermsPage,
});

// Public invoice route (no auth required)
const publicInvoiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'invoice/$token',
  component: PublicInvoicePage,
  validateSearch: (search: Record<string, unknown>) => ({
    payment: (search.payment as string) || undefined,
  }),
});

// Protected routes wrapper - redirects to signin if not authenticated
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  beforeLoad: ({ context }) => {
    const { auth } = context as { auth: { isAuthenticated: boolean } };
    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/auth/signin',
      });
    }
  },
  component: () => <Outlet />,
});

// Dashboard
const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard',
  component: DashboardPage,
});

// Clients routes
const clientsRoute = createRoute({
  getParentRoute: () => protectedRoute,
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
  getParentRoute: () => protectedRoute,
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
  getParentRoute: () => protectedRoute,
  path: 'settings',
  component: SettingsPage,
});

// Build route tree
const routeTree = rootRoute.addChildren([
  landingRoute,
  privacyRoute,
  termsRoute,
  verifyRoute,
  authRoute.addChildren([signInRoute, signUpRoute]),
  publicInvoiceRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    clientsRoute.addChildren([clientsIndexRoute, clientsNewRoute, clientsEditRoute]),
    invoicesRoute.addChildren([invoicesIndexRoute, invoicesNewRoute, invoicesDetailRoute, invoicesEditRoute]),
    settingsRoute,
  ]),
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
