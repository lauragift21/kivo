import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export function PrivacyPage() {
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
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kivo ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our invoicing service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Account information (name, email address)</li>
              <li>Business information (business name, address, logo)</li>
              <li>Client information you add to create invoices</li>
              <li>Invoice data and payment information</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you reminders and notifications about your invoices</li>
              <li>Respond to your comments, questions, and requests</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted in transit and at rest.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use trusted third-party services to help us operate our service, including Stripe for payment processing and Resend for email delivery. These services have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal information at any time. You can do this through your account settings or by contacting us directly.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our GitHub repository.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
