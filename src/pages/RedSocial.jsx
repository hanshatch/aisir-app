import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { ago, RED_COLORS } from '@/lib/utils'

const REDES = ['linkedin', 'instagram', 'x', 'tiktok', 'facebook', 'newsletter', 'articulo']

const STATUS_STYLES = {
  aprobado:             { color: '#7ec832', label: 'Aprobado' },
  publicado:            { color: '#4f9eff', label: 'Publicado' },
  pendiente_aprobacion: { color: '#e09820', label: 'Pendiente' },
  rechazado:            { color: '#e04545', label: 'Rechazado' },
  borrador:             { color: '#5c7a50', label: 'Borrador' },
}

function RedIcon({ red, size = 14, color }) {
  const fill = color ?? RED_COLORS[red] ?? '#5c7a50'
  switch (red) {
    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      )
    case 'x':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.734l7.736-8.846L2.085 2.25H8.23l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.16a8.27 8.27 0 004.84 1.55V7.27a4.85 4.85 0 01-1.07-.58z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    default:
      return null
  }
}

function PostCard({ item }) {
  const red = item.tipo ?? item.red ?? 'otros'
  const color = RED_COLORS[red] ?? '#5c7a50'
  const status = STATUS_STYLES[item.estado] ?? STATUS_STYLES.borrador

  return (
    <div
      style={{
        background: '#0d110d',
        border: '1px solid #1e2d1a',
        borderRadius: 4,
        borderLeft: `3px solid ${color}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color + '55'
        e.currentTarget.style.boxShadow = `0 0 16px ${color}10`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e2d1a'
        e.currentTarget.style.borderLeftColor = color
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="p-3">
        {/* Network + status row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span style={{ color }}>
              <RedIcon red={red} size={14} color={color} />
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-wide"
              style={{ color }}
            >
              {red}
            </span>
          </div>
          <span
            className="font-mono text-[9px] px-1.5 py-0.5"
            style={{
              color: status.color,
              background: status.color + '18',
              border: `1px solid ${status.color}35`,
              borderRadius: 2,
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Title */}
        <p className="text-xs font-semibold text-ink line-clamp-2 leading-snug mb-2">
          {item.titulo ?? item.title ?? `#${item.id}`}
        </p>

        {/* Snippet */}
        {(item.contenido_preview ?? item.preview ?? item.snippet) && (
          <p className="font-mono text-[10px] line-clamp-3 leading-relaxed mb-2" style={{ color: '#3d5535' }}>
            {item.contenido_preview ?? item.preview ?? item.snippet}
          </p>
        )}

        {/* Footer */}
        <p className="font-mono text-[9px] text-muted mt-1">
          #{item.id} · {ago(item.created_at ?? item.fecha)}
          {item.fecha_programada && (
            <span style={{ color: '#2a3d24' }}>
              {' '}· prog. {new Date(item.fecha_programada).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

export default function RedSocial() {
  const [activeRed, setActiveRed] = useState('all')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contenido'],
    queryFn: api.contenido,
    refetchInterval: 60_000,
  })

  const all = data?.items ?? data ?? []
  const socialTypes = new Set(['linkedin', 'instagram', 'x', 'tiktok', 'facebook', 'whatsapp'])
  const items = all.filter((i) => socialTypes.has(i.tipo ?? i.red ?? ''))

  const filtered = activeRed === 'all'
    ? items
    : items.filter((i) => (i.tipo ?? i.red) === activeRed)

  // Counts per red
  const counts = {}
  items.forEach((i) => {
    const r = i.tipo ?? i.red ?? 'otros'
    counts[r] = (counts[r] ?? 0) + 1
  })

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-ink">Red Social</h1>
        <p className="font-mono text-xs mt-1 text-muted">
          Contenido adaptado por plataforma
        </p>
      </div>

      {isError && (
        <div
          className="mb-4 px-4 py-3 font-mono text-xs"
          style={{ background: '#1a0808', border: '1px solid #e04545', borderRadius: 3, color: '#e04545' }}
        >
          Error cargando contenido
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        <button
          onClick={() => setActiveRed('all')}
          className="font-mono text-[10px] uppercase px-3 py-1.5 transition-all"
          style={{
            background: activeRed === 'all' ? '#7ec83218' : '#0d110d',
            color: activeRed === 'all' ? '#7ec832' : '#5c7a50',
            border: `1px solid ${activeRed === 'all' ? '#7ec83240' : '#1e2d1a'}`,
            borderRadius: 3,
          }}
        >
          Todos · {items.length}
        </button>
        {Object.entries(counts).map(([red, count]) => {
          const color = RED_COLORS[red] ?? '#5c7a50'
          const isActive = activeRed === red
          return (
            <button
              key={red}
              onClick={() => setActiveRed(red)}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase px-3 py-1.5 transition-all"
              style={{
                background: isActive ? color + '18' : '#0d110d',
                color: isActive ? color : '#5c7a50',
                border: `1px solid ${isActive ? color + '40' : '#1e2d1a'}`,
                borderRadius: 3,
              }}
            >
              <RedIcon red={red} size={10} color={isActive ? color : '#5c7a50'} />
              {red} · {count}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse" style={{ background: '#0d110d', borderRadius: 4 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-mono text-xs text-muted mb-2">Sin contenido para esta red</p>
          <p className="font-mono text-[10px]" style={{ color: '#2a3d24' }}>
            Genera contenido con /generar vía Telegram
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <PostCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
