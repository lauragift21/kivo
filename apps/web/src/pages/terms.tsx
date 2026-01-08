import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Kivo, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kivo is an invoicing platform designed for freelancers and independent creators. We provide tools to create, send, and track invoices, manage clients, and accept payments.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To use Kivo, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to use Kivo to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Violate any laws or regulations</li>
              <li>Send fraudulent or misleading invoices</li>
              <li>Infringe on the rights of others</li>
              <li>Distribute malware or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Payment Processing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Payment processing is handled by Stripe. By using our payment features, you also agree to Stripe's terms of service. We are not responsible for any issues arising from payment processing.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kivo and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kivo is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through our GitHub repository.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
