import { cn } from '@/lib/utils'

/**
 * Empty state with icon and message.
 * @param {{ icon?: React.ReactNode, title: string, message?: string, className?: string }} props
 */
export function EmptyState({ icon, title, message, className }) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center text-center py-16 px-8', className)}
    >
      {icon && (
        <div
          className="w-12 h-12 flex items-center justify-center mb-4"
          style={{
            background: '#373737',
            border: '1px solid #373737',
            borderRadius: 4,
            color: '#373737',
          }}
        >
          {icon}
        </div>
      )}
      <p className="font-mono text-xs text-muted mb-1">{title}</p>
      {message && (
        <p className="font-mono text-[10px]" style={{ color: '#373737' }}>
          {message}
        </p>
      )}
    </div>
  )
}

export default EmptyState
