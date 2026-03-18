import { cn } from '@/lib/utils'

/**
 * Metric display card.
 * @param {{ label: string, value: string|number, delta?: number, color?: string, loading?: boolean, mono?: boolean }} props
 */
export function StatCard({ label, value, delta, color = '#86a43b', loading, mono, className, style }) {
  if (loading) {
    return (
      <div
        className={cn('h-24 animate-pulse', className)}
        style={{ background: '#373737', border: '1px solid #373737', borderRadius: 4, ...style }}
      />
    )
  }

  return (
    <div
      className={cn(className)}
      style={{
        background: '#373737',
        border: '1px solid #373737',
        borderTop: `2px solid ${color}`,
        borderRadius: 4,
        padding: '16px 20px',
        ...style,
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#373737' }}>
        {label}
      </p>
      <p
        className={cn('font-black text-3xl', mono ? 'font-mono' : 'font-display')}
        style={{ color, textShadow: `0 0 16px ${color}35` }}
      >
        {value ?? '—'}
      </p>
      {delta != null && (
        <p
          className="font-mono text-[10px] mt-1"
          style={{ color: delta >= 0 ? '#86a43b' : '#878787' }}
        >
          {delta >= 0 ? '+' : ''}{delta}% vs anterior
        </p>
      )}
    </div>
  )
}

export default StatCard
