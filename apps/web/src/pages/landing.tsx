import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { 
  FileText, 
  Users, 
  Bell, 
  Globe, 
  CreditCard, 
  LayoutDashboard,
  ArrowRight,
  Check,
  CheckCircle,
  X,
  Play,
  Target,
  User,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

/**
 * Kivo Landing Page - Editorial Black & White + Indigo
 * 
 * Aesthetic: Magazine-quality, sophisticated, premium
 * Typography: Instrument Serif (headlines) + Geist (body)
 * Colors: Black & white base with indigo accent #6366F1
 */

// GitHub icon SVG component
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

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

// Video Modal Component
function VideoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl mx-4 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
          aria-label="Close video"
        >
          <X className="h-8 w-8" />
        </button>
        
        <div className="relative bg-foreground rounded-2xl overflow-hidden shadow-2xl aspect-video">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Play className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Demo video coming soon</p>
            <p className="text-sm text-white/60 mt-2">Check back later for a full walkthrough</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating pill header
function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      scrolled ? 'top-2' : 'top-4'
    }`}>
      <div className={`flex items-center gap-2 px-2 py-2 rounded-full border transition-all duration-300 ${
        scrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-border' 
          : 'bg-background/80 backdrop-blur-sm border-border/50'
      }`}>
        <div className="pl-3">
          <Logo size="sm" />
        </div>
        
        <nav className="hidden md:flex items-center">
          <a 
            href="#features" 
            className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-2 pl-2">
          <a 
            href="https://github.com/lauragift21/kivo" 
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <GitHubIcon className="h-4 w-4" />
          </a>
          <Link 
            to="/auth/signin"
            className="hidden sm:inline-flex px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Button size="sm" className="rounded-full px-4" asChild>
            <Link to="/auth/signup">Try free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// Invoice mockup with editorial styling
function InvoiceMockup() {
  return (
    <div className="relative">
      {/* Shadow layer for depth */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 bg-foreground/5 rounded-2xl" />
      
      {/* Main invoice card */}
      <div className="relative w-[320px] bg-card rounded-2xl shadow-card-hover border overflow-hidden animate-float">
        {/* Indigo accent stripe */}
        <div className="h-1 bg-primary" />
        
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Invoice</span>
            <span className="text-sm font-semibold font-mono">#INV-001</span>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Acme Corporation</p>
            <p className="text-sm text-muted-foreground">Due: Jan 15, 2026</p>
          </div>
        </div>

        {/* Line items */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Website Redesign</span>
            <span className="font-medium font-mono">$1,800.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Consulting (10hrs)</span>
            <span className="font-medium font-mono">$650.00</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold font-mono">$2,450.00</span>
          </div>
        </div>

        {/* Status */}
        <div className="px-6 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-subtle" />
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">Sent</span>
          </div>
        </div>
      </div>

      {/* Notification toast - hidden on mobile */}
      <div className="absolute -right-4 top-12 animate-notification hidden sm:block">
        <div className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl shadow-kivo-xl">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Payment received!</span>
        </div>
      </div>
    </div>
  );
}

function HeroSection({ onViewDemo }: { onViewDemo: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-20 px-6 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-secondary/50 text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-subtle" />
              <span className="text-muted-foreground">Free to start</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="text-muted-foreground">No credit card</span>
            </div>

            {/* Editorial headline with serif font */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-6.5xl tracking-tight mb-6 leading-[1.1]">
              Invoicing that fits{' '}
              <span className="relative inline-block">
                <span className="relative z-10">how you work.</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-primary/15 -z-0" />
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Modern invoicing for freelancers and independent creators. Create, send, and track invoices—know exactly when work is settled.
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link to="/auth/signup">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-6" onClick={onViewDemo}>
                <Play className="mr-2 h-4 w-4" />
                View demo
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
    <section ref={ref} className="py-20 px-6 relative">
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-on-scroll">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight mb-8 leading-tight">
            Invoicing should not feel{' '}
            <span className="italic text-muted-foreground">stressful.</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Most tools are{' '}
            <span className="relative inline-block px-1">
              <span className="relative z-10">bloated</span>
              <span className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted-foreground/40" />
            </span>,{' '}
            <span className="relative inline-block px-1">
              <span className="relative z-10">loud</span>
              <span className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted-foreground/40" />
            </span>,{' '}
            or built for accounting teams. You just want to send a clear invoice and move on.
          </p>

          <div className="inline-flex items-center px-6 py-3 bg-secondary rounded-full">
            <span className="text-lg font-medium">Kivo is built for that.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DifferentiatorCard({ 
  icon: Icon,
  title, 
  description,
  delay 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string; 
  description: string;
  delay: string;
}) {
  return (
    <div className={`animate-on-scroll ${delay} group relative p-8 rounded-2xl border bg-card card-hover-border transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1`}>
      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function DifferentiatorsSection() {
  const ref = useScrollAnimation();
  
  const differentiators = [
    {
      icon: Target,
      title: 'Clear by default',
      description: 'Every invoice has one job. To move from sent to settled. No clutter.',
    },
    {
      icon: User,
      title: 'Built for independent work',
      description: 'Freelancers, consultants, and creators do not need enterprise software. Kivo stays focused.',
    },
    {
      icon: Bell,
      title: 'Automatic reminders',
      description: 'Reminders go out when needed. You do not have to chase clients.',
    },
    {
      icon: Zap,
      title: 'Modern and reliable',
      description: 'Fast, secure, and built on a global network you can trust.',
    },
  ];

  return (
    <section ref={ref} className="py-16 px-6 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      
      <div className="relative max-w-5xl mx-auto">
        <div className="animate-on-scroll text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight">
            Why Kivo
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
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
    <div className={`animate-on-scroll ${delay} group relative p-6 rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover`}>
      {/* Hover accent line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-foreground/5">
          <Icon className="h-6 w-6 text-foreground" />
        </div>
        <h3 className="font-semibold mb-2 text-lg">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
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
      description: 'Keep client details organized in one place.',
    },
    {
      icon: FileText,
      title: 'Invoices',
      description: 'Create invoices with line items, taxes, and discounts.',
    },
    {
      icon: Globe,
      title: 'Public invoice links',
      description: 'Clients view and pay invoices without logging in.',
    },
    {
      icon: CreditCard,
      title: 'Payments',
      description: 'Accept card payments with Stripe. Auto-mark as settled.',
    },
    {
      icon: Bell,
      title: 'Reminders',
      description: 'Automatic reminders before and after due dates.',
    },
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'See outstanding, overdue, and settled invoices at a glance.',
    },
  ];

  return (
    <section id="features" ref={ref} className="py-16 px-6 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <div className="animate-on-scroll text-center mb-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4 block">Features</span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight">
            Core features
          </h2>
        </div>
        <p className="animate-on-scroll animation-delay-100 text-muted-foreground text-center mb-12 max-w-xl mx-auto text-lg">
          Everything you need to manage invoicing. Nothing you do not.
        </p>
        
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
    <section id="how-it-works" ref={ref} className="py-16 px-6 bg-secondary/30 scroll-mt-20 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      <div className="relative max-w-5xl mx-auto">
        <div className="animate-on-scroll text-center mb-12">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4 block">Process</span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight">
            How it works
          </h2>
        </div>
        
        {/* Desktop & Mobile: Simple card grid */}
        <div className="animate-on-scroll animation-delay-200">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Card */}
                  <div className={`relative p-6 rounded-2xl border h-full transition-all duration-300 ${
                    step.isLast 
                      ? 'bg-foreground border-foreground text-white hover:shadow-kivo-xl' 
                      : 'bg-card border-border hover:shadow-card-hover hover:-translate-y-1'
                  }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      step.isLast ? 'bg-white/20' : 'bg-secondary'
                    }`}>
                      <Icon className={`h-6 w-6 ${step.isLast ? 'text-white' : 'text-foreground'}`} />
                    </div>
                    
                    <h3 className={`font-semibold mb-2 ${step.isLast ? 'text-white' : 'text-foreground'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${step.isLast ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({ onViewDemo }: { onViewDemo: () => void }) {
  const ref = useScrollAnimation();

  return (
    <section ref={ref} className="py-16 px-6 relative overflow-hidden">
      <div className="relative max-w-4xl mx-auto">
        <div className="animate-on-scroll">
          {/* Card-based CTA */}
          <div className="relative bg-card rounded-3xl border shadow-card-hover p-12 md:p-16 text-center overflow-hidden">
            {/* Black accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-foreground" />
            
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6 block">Get Started</span>
            
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
              Start using Kivo today.
            </h2>
            
            <p className="text-muted-foreground mb-10 text-lg max-w-lg mx-auto">
              Send your first invoice in minutes and close the loop on your work.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link to="/auth/signup">
                  Get started free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-6 border-foreground text-foreground hover:bg-foreground hover:text-background" onClick={onViewDemo}>
                <Play className="mr-2 h-5 w-5" />
                View demo
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Free plan available
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Cancel anytime
              </span>
            </div>
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
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Logo />
            <div className="h-4 w-px bg-border hidden md:block" />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Kivo. All rights reserved.
            </p>
          </div>
          
          <nav className="flex flex-wrap items-center justify-center gap-8">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <a 
              href="https://github.com/lauragift21/kivo" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <GitHubIcon className="h-4 w-4" />
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onViewDemo={() => setIsVideoOpen(true)} />
        <ProblemSection />
        <DifferentiatorsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection onViewDemo={() => setIsVideoOpen(true)} />
      </main>
      <Footer />
      
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </div>
  );
}
