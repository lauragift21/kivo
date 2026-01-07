import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeMap = {
  sm: { svg: 24, text: 'text-base' },
  md: { svg: 32, text: 'text-lg' },
  lg: { svg: 36, text: 'text-xl' },
};

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const { svg, text } = sizeMap[size];
  
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg 
        width={svg} 
        height={svg} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="6" fill="currentColor" className="text-foreground"/>
        <path d="M9 10h14M9 16h10M9 22h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      {showText && (
        <span className={cn('font-semibold tracking-tight', text)}>Kivo</span>
      )}
    </div>
  );
}
