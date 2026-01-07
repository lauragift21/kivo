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
  Sparkles,
  X,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Kivo Landing Page
 * 
 * Design principles:
 * - Clean, minimal, professional
 * - Black and white with subtle orange touches
 * - Visual spark with micro-interactions
 * - Generous whitespace
 */

// GitHub icon SVG component (lucide deprecated brand icons)
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
          aria-label="Close video"
        >
          <X className="h-8 w-8" />
        </button>
        
        {/* Video container */}
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
          {/* Replace this with your actual video embed */}
          {/* YouTube example: */}
          {/* <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
            title="Kivo Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          /> */}
          
          {/* Or use a placeholder if no video yet */}
          
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
        </nav>
        <div className="flex items-center gap-3">
          <a 
            href="https://github.com/lauragift21/kivo" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors hover:border-foreground/20"
          >
            <GitHubIcon className="h-4 w-4" />
            Star on GitHub
          </a>
          <Button size="sm" asChild>
            <Link to="/auth/signin">Sign in</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// Enhanced Invoice mockup with layered depth and notification
function InvoiceMockup() {
  return (
    <div className="relative">
      {/* Dot pattern background */}
      <div className="absolute -inset-8 dot-pattern opacity-50 rounded-3xl" />
      
      {/* Background card (for depth) */}
      <div className="absolute -left-4 top-4 w-[320px] bg-card rounded-2xl shadow-lg border opacity-60 h-[360px] -rotate-3" />
      
      {/* Main invoice card */}
      <div className="relative w-[320px] bg-card rounded-2xl shadow-xl border overflow-hidden animate-float">
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

      {/* Animated notification toast */}
      <div className="absolute -right-4 top-8 animate-notification">
        <div className="flex items-center gap-2 px-4 py-3 bg-accent text-white rounded-xl shadow-lg">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Payment received!</span>
        </div>
      </div>
    </div>
  );
}

function HeroSection({ onViewDemo }: { onViewDemo: () => void }) {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-secondary/50 text-sm text-muted-foreground mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-subtle" />
              Free to start · No credit card required
            </div>

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
              <Button variant="outline" size="lg" onClick={onViewDemo}>
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
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="animate-on-scroll">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-6">
            Invoicing should not feel stressful.
          </h2>
          <p className="text-muted-foreground mb-4 text-lg">
            Most tools are{' '}
            <span className="line-through decoration-muted-foreground/40">bloated</span>,{' '}
            <span className="line-through decoration-muted-foreground/40">loud</span>,{' '}
            or built for accounting teams.
          </p>
          <p className="text-muted-foreground mb-8 text-lg">
            You just want to send a clear invoice, follow up automatically, and move on with your work.
          </p>
          <p className="text-xl font-semibold inline-flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
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
    <div className={`animate-on-scroll ${delay} p-6 rounded-xl border bg-card card-lift`}>
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

// Enhanced Feature card with hover animations
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
    <div className={`animate-on-scroll ${delay} group relative p-6 rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-l-2 hover:border-l-accent`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-accent/10">
          <Icon className="h-6 w-6 text-foreground transition-colors duration-300 group-hover:text-accent" />
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
        
        {/* Desktop: Card grid with dashed connecting line */}
        <div className="animate-on-scroll animation-delay-200">
          <div className="hidden md:block">
            {/* Dashed connecting line */}
            <div className="relative">
              <div className="absolute top-[72px] left-[12.5%] right-[12.5%] dashed-line" />
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 relative">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative">
                    {/* Card */}
                    <div className={`relative p-6 rounded-2xl border h-full transition-all duration-300 ${
                      step.isLast 
                        ? 'bg-accent border-accent text-white hover:bg-accent/90' 
                        : 'bg-background border-border hover:shadow-md hover:-translate-y-1'
                    }`}>
                      {/* Step number badge */}
                      <div className={`absolute -top-3 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                        step.isLast
                          ? 'bg-white text-accent'
                          : 'bg-foreground text-background'
                      }`}>
                        {step.number}
                      </div>
                      
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        step.isLast
                          ? 'bg-white/20'
                          : 'bg-secondary'
                      }`}>
                        <Icon className={`h-6 w-6 ${step.isLast ? 'text-white' : 'text-foreground'}`} />
                      </div>
                      
                      {/* Content */}
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

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative pl-8 pb-8 last:pb-0">
                {/* Vertical dashed line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[11px] top-10 bottom-0 w-0 border-l-2 border-dashed border-border" />
                )}
                
                {/* Number circle */}
                <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.isLast
                    ? 'bg-accent text-white'
                    : 'bg-foreground text-background'
                }`}>
                  {step.number}
                </div>
                
                {/* Content card */}
                <div className={`p-4 rounded-xl border ${
                  step.isLast 
                    ? 'bg-accent border-accent text-white' 
                    : 'bg-background border-border'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-5 w-5 ${step.isLast ? 'text-white' : 'text-foreground'}`} />
                    <h3 className={`font-semibold ${step.isLast ? 'text-white' : 'text-foreground'}`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className={`text-sm ${step.isLast ? 'text-white/80' : 'text-muted-foreground'}`}>
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

function CTASection({ onViewDemo }: { onViewDemo: () => void }) {
  const ref = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6 relative overflow-hidden">
      <div className="relative max-w-3xl mx-auto text-center">
        <div className="animate-on-scroll">
          {/* Decorative border container */}
          <div className="p-12 rounded-2xl border bg-card/50">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Start using Kivo today.
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Send your first invoice in minutes and close the loop on your work.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" asChild>
                <Link to="/auth/signup">
                  Get started free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" onClick={onViewDemo}>
                <Play className="mr-2 h-5 w-5" />
                View demo
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-3 mt-8 text-sm text-muted-foreground">
              <span>No credit card required</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Free forever for basics</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Cancel anytime</span>
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
              href="https://github.com/lauragift21/kivo" 
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
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleOpenVideo = () => setIsVideoOpen(true);
  const handleCloseVideo = () => setIsVideoOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onViewDemo={handleOpenVideo} />
        <ProblemSection />
        <DifferentiatorsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection onViewDemo={handleOpenVideo} />
      </main>
      <Footer />
      
      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={handleCloseVideo} />
    </div>
  );
}
