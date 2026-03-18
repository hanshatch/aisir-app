import { cn } from '@/lib/utils'

/**
 * Dark surface card.
 * @param {{ accentColor?: string, className?: string, children: React.ReactNode }} props
 */
export function Card({ accentColor, className, children, style, ...rest }) {
  return (
    <div
      className={cn('relative', className)}
      style={{
        background: '#373737',
        border: '1px solid #373737',
        borderRadius: 4,
        ...style,
      }}
      {...rest}
    >
      {accentColor && (
        <div
          style={{
            height: 2,
            background: accentColor,
            boxShadow: `0 0 10px ${accentColor}70`,
            borderRadius: '3px 3px 0 0',
          }}
        />
      )}
      {children}
    </div>
  )
}

export function CardHeader({ className, children, style, ...rest }) {
  return (
    <div
      className={cn('px-4 py-3', className)}
      style={{ borderBottom: '1px solid #373737', ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...rest }) {
  return (
    <p
      className={cn('font-mono text-xs uppercase tracking-widest text-muted', className)}
      {...rest}
    >
      {children}
    </p>
  )
}

export function CardBody({ className, children, ...rest }) {
  return (
    <div className={cn('p-4', className)} {...rest}>
      {children}
    </div>
  )
}

export default Card
