/** Reusable Badge component */
type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'dev' | 'staging' | 'prod';

const VARIANTS: Record<Variant, string> = {
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20  text-amber-400  border-amber-500/30',
  error:   'bg-red-500/20    text-red-400    border-red-500/30',
  info:    'bg-blue-500/20   text-blue-400   border-blue-500/30',
  neutral: 'bg-gray-500/20   text-gray-400   border-gray-500/30',
  dev:     'bg-amber-500/20  text-amber-300  border-amber-500/40',
  staging: 'bg-blue-600/20   text-blue-300   border-blue-500/40',
  prod:    'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant = 'neutral', children, className = '' }: BadgeProps) => (
  <span className={`
    inline-flex items-center gap-1 px-2 py-0.5 rounded-full
    text-xs font-semibold border ${VARIANTS[variant]} ${className}
  `}>
    {children}
  </span>
);

export default Badge;
export type { Variant as BadgeVariant };
