import { cn } from '@/lib/utils'

const VARIANTS = {
  default: {
    bg: '#373737',
    color: '#8aab78',
    border: '#373737',
  },
  green: {
    bg: '#0d1f08',
    color: '#86a43b',
    border: '#86a43b40',
  },
  red: {
    bg: '#1a0808',
    color: '#878787',
    border: '#87878740',
  },
  amber: {
    bg: '#2a1f00',
    color: '#e09820',
    border: '#e0982040',
  },
  blue: {
    bg: '#081420',
    color: '#86a43b',
    border: '#86a43b40',
  },
  purple: {
    bg: '#1a0f2e',
    color: '#9b72e8',
    border: '#9b72e840',
  },
  muted: {
    bg: '#373737',
    color: '#5c7a50',
    border: '#373737',
  },
}

/**
 * @param {{ variant?: keyof typeof VARIANTS, color?: string, className?: string, children: React.ReactNode }} props
 */
export function Badge({ variant = 'default', color, className, children, ...rest }) {
  const s = VARIANTS[variant] ?? VARIANTS.default
  return (
    <span
      className={cn('inline-block font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5', className)}
      style={{
        background: color ? color + '18' : s.bg,
        color: color ?? s.color,
        border: `1px solid ${color ? color + '40' : s.border}`,
        borderRadius: 2,
        ...rest.style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
}

export default Badge
