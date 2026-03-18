import { cn } from '@/lib/utils'

/**
 * Button with Norse aesthetic.
 * @param {{ variant?: 'primary'|'outline'|'ghost'|'danger', size?: 'sm'|'md', className?: string }} props
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  style,
  ...rest
}) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  }

  const variants = {
    primary: {
      background: disabled ? '#3d5535' : '#7ec832',
      color: '#060908',
      border: 'none',
      boxShadow: disabled ? 'none' : '0 0 12px rgba(126,200,50,0.25)',
      cursor: disabled ? 'not-allowed' : 'pointer',
    },
    outline: {
      background: 'transparent',
      color: disabled ? '#3d5535' : '#7ec832',
      border: `1px solid ${disabled ? '#2a3d24' : '#7ec83260'}`,
      cursor: disabled ? 'not-allowed' : 'pointer',
    },
    ghost: {
      background: 'transparent',
      color: disabled ? '#3d5535' : '#8aab78',
      border: '1px solid transparent',
      cursor: disabled ? 'not-allowed' : 'pointer',
    },
    danger: {
      background: disabled ? '#2a1515' : '#e04545',
      color: '#fff',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
    },
  }

  const v = variants[variant] ?? variants.primary

  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-display font-bold transition-all duration-150',
        sizes[size],
        className
      )}
      style={{
        borderRadius: 3,
        letterSpacing: '0.04em',
        ...v,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
