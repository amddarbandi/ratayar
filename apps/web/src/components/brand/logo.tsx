import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  size?: number;
}

export function LogoIcon({ className, size = 40 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="راتایار"
    >
      <defs>
        <linearGradient id="rgrad-c" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="rtrail-c" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        d="M 14 52 L 14 12 L 34 12 Q 46 12 46 24 Q 46 34 36 35 L 46 52"
        stroke="url(#rgrad-c)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 46 24 Q 56 24 56 34"
        stroke="url(#rtrail-c)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 44 32 Q 58 32 58 44"
        stroke="url(#rtrail-c)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M 42 40 Q 60 40 60 52"
        stroke="url(#rtrail-c)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <circle cx="56" cy="34" r="2.5" fill="#06b6d4" />
      <circle cx="58" cy="44" r="2" fill="#22d3ee" opacity="0.75" />
      <circle cx="60" cy="52" r="1.5" fill="#67e8f9" opacity="0.5" />
    </svg>
  );
}

export function LogoWordmark({ className }: Props) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LogoIcon size={32} />
      <span className="text-xl font-bold gradient-text">راتایار</span>
    </div>
  );
}
