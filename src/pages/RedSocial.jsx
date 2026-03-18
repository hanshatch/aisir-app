import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid } from 'lucide-react'
import { api } from '@/api/client'
import { ago, RED_COLORS } from '@/lib/utils'

const REDES = ['linkedin', 'instagram', 'x', 'tiktok', 'facebook', 'newsletter', 'articulo']

const RED_META = {
  linkedin:   { label: 'LinkedIn',    color: '#0a66c2', bg: '#eff6ff' },
  instagram:  { label: 'Instagram',   color: '#e1306c', bg: '#fff1f5' },
  x:          { label: 'X',           color: '#374151', bg: '#f9fafb' },
  tiktok:     { label: 'TikTok',      color: '#ee1d52', bg: '#fff1f2' },
  facebook:   { label: 'Facebook',    color: '#1877f2', bg: '#eff6ff' },
  newsletter: { label: 'Newsletter',  color: '#d97706', bg: '#fffbeb' },
  articulo:   { label: 'Artículo',    color: '#76a72b', bg: '#f0f7e6' },
}

const STATUS_STYLES = {
  pendiente_aprobacion: { color: '#d97706', bg: '#fffbeb', label: 'Pendiente' },
  aprobado:             { color: '#16a34a', bg: '#f0fdf4', label: 'Aprobado' },
  rechazado:            { color: '#dc2626', bg: '#fef2f2', label: 'Rechazado' },
  borrador:             { color: '#878787', bg: '#f5f4f0', label: 'Borrador' },
  publicado:            { color: '#0a66c2', bg: '#eff6ff', label: 'Publicado' },
}

function LinkedInIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function InstagramIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function XIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.734l7.736-8.846L2.085 2.25H8.23l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

function TikTokIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.16a8.27 8.27 0 004.84 1.55V7.27a4.85 4.85 0 01-1.07-.58z" />
    </svg>
  )
}

function FacebookIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function MailIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function ArticuloIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  )
}

function RedIcon({ red, size = 14, color }) {
  const c = color ?? RED_META[red]?.color ?? '#878787'
  switch (red) {
    case 'linkedin':   return <LinkedInIcon size={size} color={c} />
    case 'instagram':  return <InstagramIcon size={size} color={c} />
    case 'x':          return <XIcon size={size} color={c} />
    case 'tiktok':     return <TikTokIcon size={size} color={c} />
    case 'facebook':   return <FacebookIcon size={size} color={c} />
    case 'newsletter': return <MailIcon size={size} color={c} />
    case 'articulo':   return <ArticuloIcon size={size} color={c} />
    default:           return null
  }
}

function PostCard({ item }) {
  const red = item.tipo ?? item.red ?? 'otros'
  const meta = RED_META[red] ?? { color: '#878787', bg: '#f5f4f0', label: red }
  const statusKey = item.estado ?? 'borrador'
  const status = STATUS_STYLES[statusKey] ?? STATUS_STYLES.borrador
  const preview = item.contenido_preview ?? item.preview ?? item.snippet

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e4e1db',
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px ${meta.color}30`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)'
      }}
    >
      <div className="p-4">
        {/* Top row: network + status */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center gap-1.5 font-bold"
            style={{
              background: meta.bg,
              color: meta.color,
              border: `1px solid ${meta.color}30`,
              borderRadius: 6,
              padding: '4px 10px',
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: 11,
            }}
          >
            <RedIcon red={red} size={12} color={meta.color} />
            {meta.label}
          </div>
          <span
            className="font-bold"
            style={{
              background: status.bg,
              color: status.color,
              border: `1px solid ${status.color}30`,
              borderRadius: 6,
              padding: '4px 10px',
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: 11,
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Title */}
        <p
          className="font-black leading-snug mb-2 line-clamp-2"
          style={{
            color: '#2a2a2a',
            fontFamily: '"Nunito Sans", sans-serif',
            fontSize: 14,
          }}
        >
          {item.titulo ?? item.title ?? `#${item.id}`}
        </p>

        {/* Preview snippet */}
        {preview && (
          <p
            className="leading-relaxed line-clamp-3 mb-3"
            style={{
              color: '#878787',
              fontFamily: 'Roboto, sans-serif',
              fontSize: 12,
            }}
          >
            {preview}
          </p>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2"
          style={{ borderTop: '1px solid #f0eeea' }}
        >
          <span
            style={{
              color: '#ababab',
              fontFamily: '"Roboto Mono", monospace',
              fontSize: 10,
            }}
          >
            #{item.id} · {ago(item.created_at ?? item.fecha)}
          </span>
          {item.fecha_programada && (
            <span
              style={{
                background: '#f0f7e6',
                color: '#76a72b',
                border: '1px solid #76a72b30',
                borderRadius: 5,
                padding: '2px 7px',
                fontFamily: '"Roboto Mono", monospace',
                fontSize: 10,
              }}
            >
              {new Date(item.fecha_programada).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          )}
        </div>
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
  const socialTypes = new Set(['linkedin', 'instagram', 'x', 'tiktok', 'facebook', 'newsletter', 'articulo'])
  const items = all.filter((i) => socialTypes.has(i.tipo ?? i.red ?? ''))

  const filtered = activeRed === 'all'
    ? items
    : items.filter((i) => (i.tipo ?? i.red) === activeRed)

  const counts = {}
  items.forEach((i) => {
    const r = i.tipo ?? i.red ?? 'otros'
    counts[r] = (counts[r] ?? 0) + 1
  })

  const availableRedes = REDES.filter((r) => counts[r] > 0)

  return (
    <div className="p-6 animate-fade-in" style={{ background: '#f0eeea', minHeight: '100%' }}>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="font-black"
          style={{
            color: '#2a2a2a',
            fontFamily: '"Nunito Sans", sans-serif',
            fontSize: 24,
          }}
        >
          Red Social
        </h1>
        <p
          className="mt-1"
          style={{
            color: '#878787',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 13,
          }}
        >
          Contenido adaptado por plataforma
        </p>
      </div>

      {isError && (
        <div
          className="mb-4 px-4 py-3"
          style={{
            background: '#fef2f2',
            border: '1px solid #dc262640',
            borderRadius: 8,
            color: '#dc2626',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 13,
          }}
        >
          Error cargando contenido
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <button
          onClick={() => setActiveRed('all')}
          className="font-bold transition-all"
          style={{
            background: activeRed === 'all' ? '#76a72b' : '#ffffff',
            color: activeRed === 'all' ? '#ffffff' : '#878787',
            border: `1px solid ${activeRed === 'all' ? '#76a72b' : '#e4e1db'}`,
            borderRadius: 20,
            padding: '7px 16px',
            fontFamily: '"Nunito Sans", sans-serif',
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: activeRed === 'all' ? '0 2px 8px rgba(118,167,43,0.25)' : 'none',
          }}
        >
          Todos · {items.length}
        </button>

        {availableRedes.map((red) => {
          const meta = RED_META[red] ?? { color: '#878787', bg: '#f5f4f0', label: red }
          const isActive = activeRed === red
          return (
            <button
              key={red}
              onClick={() => setActiveRed(red)}
              className="flex items-center gap-1.5 font-bold transition-all"
              style={{
                background: isActive ? meta.color : '#ffffff',
                color: isActive ? '#ffffff' : '#878787',
                border: `1px solid ${isActive ? meta.color : '#e4e1db'}`,
                borderRadius: 20,
                padding: '7px 14px',
                fontFamily: '"Nunito Sans", sans-serif',
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: isActive ? `0 2px 8px ${meta.color}40` : 'none',
              }}
            >
              <RedIcon red={red} size={12} color={isActive ? '#ffffff' : meta.color} />
              {meta.label} · {counts[red]}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: 148,
                background: '#f7f6f3',
                borderRadius: 10,
                border: '1px solid #e4e1db',
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16"
          style={{
            background: '#ffffff',
            border: '1px solid #e4e1db',
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
          }}
        >
          <div
            className="flex items-center justify-center mx-auto mb-4"
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#f7f6f3',
            }}
          >
            <LayoutGrid size={24} color="#ababab" />
          </div>
          <p
            className="font-bold mb-1"
            style={{
              color: '#2a2a2a',
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: 15,
            }}
          >
            Sin contenido para esta red
          </p>
          <p
            style={{
              color: '#ababab',
              fontFamily: 'Roboto, sans-serif',
              fontSize: 13,
            }}
          >
            Genera contenido con /generar vía Telegram
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <PostCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
