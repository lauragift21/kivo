import { Link } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { 
  FileText, 
  Users, 
  Bell, 
  Globe, 
  CreditCard, 
  LayoutDashboard,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Kivo Landing Page
 * 
 * Design principles:
 * - Clean, minimal, professional
 * - Black and white with subtle orange touches
 * - No gradients, no blur effects
 * - Generous whitespace
 */

// Hook for scroll-triggered animations
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center">
          <FileText className="h-4.5 w-4.5 text-background" />
        </div>
        <span className="text-xl font-semibold tracking-tight">Kivo</span>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          <a 
            href="#features" 
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            How it works
          </a>
          <a 
            href="#developers" 
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            GitHub
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth/signin">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/auth/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// Invoice mockup component
function InvoiceMockup() {
  return (
    <div className="relative animate-float">
      {/* Main invoice card */}
      <div className="w-[320px] bg-card rounded-2xl shadow-xl border overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</span>
            <span className="text-sm font-semibold">#INV-001</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Acme Corporation</p>
            <p className="text-xs text-muted-foreground">Due: Jan 15, 2026</p>
          </div>
        </div>

        {/* Line items */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Website Redesign</span>
            <span className="font-medium">$1,800.00</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Consulting (10hrs)</span>
            <span className="font-medium">$650.00</span>
          </div>
          <div className="h-px bg-border my-3" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">$2,450.00</span>
          </div>
        </div>

        {/* Status */}
        <div className="px-5 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="text-xs font-medium text-foreground">Sent</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Invoicing that fits{' '}
              <span className="underline decoration-accent/40 decoration-2 underline-offset-4">how you work.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-xl mx-auto lg:mx-0">
              Modern invoicing for freelancers and independent creators.
            </p>
            
            <p className="text-base text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0">
              Create invoices, send them, track what is outstanding, and know when work is settled.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" asChild>
                <Link to="/auth/signup">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth/signin">View demo</Link>
              </Button>
            </div>
          </div>

          {/* Right: Mockup */}
          <div className="flex justify-center lg:justify-end">
            <InvoiceMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const ref = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="animate-on-scroll">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-6">
            Invoicing should not feel stressful.
          </h2>
          <p className="text-muted-foreground mb-4 text-lg">
            Most tools are bloated, loud, or built for accounting teams.
          </p>
          <p className="text-muted-foreground mb-8 text-lg">
            You just want to send a clear invoice, follow up automatically, and move on with your work.
          </p>
          <p className="text-xl font-semibold">
            Kivo is built for that.
          </p>
        </div>
      </div>
    </section>
  );
}

function DifferentiatorCard({ 
  title, 
  description,
  delay 
}: { 
  title: string; 
  description: string;
  delay: string;
}) {
  return (
    <div className={`animate-on-scroll ${delay} p-6 rounded-xl border bg-card hover:shadow-md transition-all duration-300`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function DifferentiatorsSection() {
  const ref = useScrollAnimation();
  
  const differentiators = [
    {
      title: 'Clear by default',
      description: 'Every invoice has one job. To move from sent to settled. No clutter.',
    },
    {
      title: 'Built for independent work',
      description: 'Freelancers, consultants, and creators do not need enterprise software. Kivo stays focused.',
    },
    {
      title: 'Reminders',
      description: 'Automatic reminders go out when needed. You do not have to chase clients.',
    },
    {
      title: 'Modern and reliable',
      description: 'Fast, secure, and built on a global network you can trust.',
    },
  ];

  return (
    <section ref={ref} className="py-24 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="animate-on-scroll text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            What makes Kivo different
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {differentiators.map((item, index) => (
            <DifferentiatorCard 
              key={item.title} 
              {...item} 
              delay={`animation-delay-${(index + 1) * 100}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Feature card with modern styling
function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  delay = ''
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string; 
  description: string;
  delay?: string;
}) {
  return (
    <div className={`animate-on-scroll ${delay} group relative p-6 rounded-xl border bg-card hover:shadow-md transition-all duration-300 overflow-hidden`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-foreground" />
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const ref = useScrollAnimation();

  const features = [
    {
      icon: Users,
      title: 'Clients',
      description: 'Keep client details in one place. Simple and organized.',
    },
    {
      icon: FileText,
      title: 'Invoices',
      description: 'Create clean invoices with line items, taxes, and discounts. Preview before sending.',
    },
    {
      icon: Globe,
      title: 'Public invoice links',
      description: 'Clients can view and download invoices without logging in.',
    },
    {
      icon: CreditCard,
      title: 'Payments',
      description: 'Accept card payments with Stripe. Mark invoices as settled automatically.',
    },
    {
      icon: Bell,
      title: 'Reminders',
      description: 'Kivo sends polite reminders before and after the due date.',
    },
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'See what is outstanding, what is overdue, and what is settled. At a glance.',
    },
  ];

  return (
    <section id="features" ref={ref} className="py-24 px-6 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <div className="animate-on-scroll text-center mb-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            Core features
          </h2>
        </div>
        <p className="animate-on-scroll animation-delay-100 text-muted-foreground text-center mb-12 max-w-xl mx-auto text-lg">
          Everything you need to manage invoicing. Nothing you do not.
        </p>
        
        {/* Standard 3-column grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              {...feature}
              delay={`animation-delay-${((index % 3) + 1) * 100}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useScrollAnimation();

  const steps = [
    { 
      number: 1, 
      title: 'Create a client',
      description: 'Add your client details once and reuse them for every invoice.',
      icon: Users,
    },
    { 
      number: 2, 
      title: 'Send an invoice',
      description: 'Build a professional invoice in seconds and send it with one click.',
      icon: FileText,
    },
    { 
      number: 3, 
      title: 'Client pays',
      description: 'Your client receives a link, views the invoice, and pays online.',
      icon: CreditCard,
    },
    { 
      number: 4, 
      title: 'Settled',
      description: 'Payment confirmed. Invoice marked as settled. You are done.',
      icon: Check,
      isLast: true,
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-24 px-6 bg-muted/30 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <div className="animate-on-scroll text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Simple process</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            How it works
          </h2>
        </div>
        
        {/* Desktop: Card grid with connecting elements */}
        <div className="animate-on-scroll animation-delay-200">
          <div className="hidden md:grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Connecting arrow (hidden on last item) */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-12 -right-3 z-10">
                      <ArrowRight className="h-5 w-5 text-border" />
                    </div>
                  )}
                  
                  {/* Card */}
                  <div className={`relative p-6 rounded-2xl border h-full transition-all duration-300 ${
                    step.isLast 
                      ? 'bg-foreground border-foreground text-background' 
                      : 'bg-background border-border hover:shadow-md'
                  }`}>
                    {/* Step number badge */}
                    <div className={`absolute -top-3 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.isLast
                        ? 'bg-background text-foreground'
                        : 'bg-foreground text-background'
                    }`}>
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      step.isLast
                        ? 'bg-background/10'
                        : 'bg-secondary'
                    }`}>
                      <Icon className={`h-6 w-6 ${step.isLast ? 'text-background' : 'text-foreground'}`} />
                    </div>
                    
                    {/* Content */}
                    <h3 className={`font-semibold mb-2 ${step.isLast ? 'text-background' : 'text-foreground'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${step.isLast ? 'text-background/70' : 'text-muted-foreground'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative pl-8 pb-8 last:pb-0">
                {/* Vertical line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[11px] top-10 bottom-0 w-0.5 bg-border" />
                )}
                
                {/* Number circle */}
                <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.isLast
                    ? 'bg-foreground text-background'
                    : 'bg-foreground text-background'
                }`}>
                  {step.number}
                </div>
                
                {/* Content card */}
                <div className={`p-4 rounded-xl border ${
                  step.isLast 
                    ? 'bg-foreground border-foreground text-background' 
                    : 'bg-background border-border'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-5 w-5 ${step.isLast ? 'text-background' : 'text-foreground'}`} />
                    <h3 className={`font-semibold ${step.isLast ? 'text-background' : 'text-foreground'}`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className={`text-sm ${step.isLast ? 'text-background/70' : 'text-muted-foreground'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6 relative overflow-hidden">
      <div className="relative max-w-3xl mx-auto text-center">
        <div className="animate-on-scroll">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Start using Kivo today.
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Send your first invoice in minutes and close the loop on your work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild>
              <Link to="/auth/signup">
                Get started free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/auth/signin">View demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Kivo. All rights reserved.
          </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <DifferentiatorsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
